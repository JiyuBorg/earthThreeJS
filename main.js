window.addEventListener("load", init) //画面ロード時にinit関数実行

function init (){
    //アスペクト比用
    const width = 960;
    const height = 540;

    let rot = 0; //回転の値。tick関数で利用。

    /*----------------------------------
     環境設定
     -----------------------------------*/
    //three.jsで必要な要素1. シーン=3D空間 作成
    const scene = new THREE.Scene();

    //three.jsで必要な要素2. カメラ作成。PerspectiveCamera引数(fov,aspect).詳細は公式doc
    const camera = new THREE.PerspectiveCamera(45, width / height);

    //three.jsで必要な要素3. レンダラー作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas"), //htmlのmyCanvas領域に対して描画
    });
    renderer.setSize(window.innerWidth, window.innerHeight); //window.innerWidth/Heightは本行実行時のウィンドウサイズ

    /*----------------------------------
     各種メッシュ設定
     -----------------------------------*/
    //球体の形状データ生成。引数(半径, 横ポリゴン数, 縦ポリゴン数) 公式docのイメージみたほうが理解早い
    const geometry = new THREE.SphereGeometry(300, 30, 30);

    //マテリアル設定。ここで画像テクスチャを指定
    const material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load("images/earthmap1k.jpg"),
    });

    //形状データとマテリアルからメッシュ生成
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth); //sceneに追加

    /*----------------------------------
     各種ライト設定
     -----------------------------------*/
    //平行光源。引数(色, 強さ)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.9);
    directionalLight.position.set(1, 1, 1); //光源の位置
    scene.add(directionalLight); //sceneに追加

    //ポイントライト。引数(色, 強さ, 範囲)
    const pointLight = new THREE.PointLight(0xffffff, 4, 1000);
    scene.add(pointLight);
    //ポイントライト自体を視覚化するための球形メッシュ(確認用). 引数(視覚化したい対象光源, サイズ)
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 30);
    // scene.add(pointLightHelper);

    /*----------------------------------
     星屑生成
     -----------------------------------*/
     function createStarField() {
        //500回ランダムなx,y,z値を生成しverticles配列に追加＝x,y,zの値がランダムに入った配列を500個生成
        const verticles = [];
        for (let i = 0; i <500; i++){
            const x = 3000 * (Math.random() - 0.5); //-0.5～0.5範囲のランダム値 * 3000(決め値)
            const y = 3000 * (Math.random() - 0.5);
            const z = 3000 * (Math.random() - 0.5);
            verticles.push(x,y,z);
        }
        //星屑の形状データ生成。BufferGeometryオブジェクトとして生成。
        const starGeometry = new THREE.BufferGeometry();
        //setAttributeでposition(位置)を設定。500個のx,y,zの3次元として)
        starGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(verticles, 3)
        );

        //星屑のマテリアル設定
        const starMaterial = new THREE.PointsMaterial({
            size: 8,
            color: 0xffffff,
        });

        //形状データとマテリアルから星屑メッシュ生成。マテリアルにPointsを使ったのでメッシュもPointsになる。
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
     }
     createStarField(); //星屑生成関数実行


     /*----------------------------------
     フレーム毎処理
     -----------------------------------*/
    //フレームごとに呼び出す関数。ここでアニメーション描画。
    function tick() {
        rot += 0.5; //1フレーム毎に回転角度0.5度＋することで回転を表現
        const radian = (rot * Math.PI) / 180; //rotをラジアンに変換。sin,cosでラジアン利用するため

        //角度に応じてカメラ位置を調整
        camera.position.x = 1000 * Math.sin(radian); 
        camera.position.z = 2000 * Math.cos(radian); 

        //カメラの見る位置を固定
        camera.lookAt(new THREE.Vector3(0, 0, -400));

        //ポイントライトを周回させる
        pointLight.position.set(
            500 * Math.sin(Date.now() / 500),
            500 * Math.sin(Date.now() / 1000),
            500 * Math.cos(Date.now() / 500),
        );
        //レンダリング
        renderer.render(scene, camera);
        requestAnimationFrame(tick); //tick内でtick実行でループ
    }

    //tick()関数実行
    tick();

    /*----------------------------------
     ウィンドウサイズ変更時処理
     -----------------------------------*/
    /* ウィンドウ変更時にサイズを維持する処理 */
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    //ウィンドウサイズ変更時にonWindowResize関数実行
    window.addEventListener("resize", onWindowResize);
}

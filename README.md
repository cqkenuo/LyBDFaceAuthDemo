# LyBDFaceAuth

uniapp 安卓端百度人脸识别、活体检测、人脸采集 demo。

### 特别提醒
此插件包含 android 端和 iOS 端，考虑到有些同学只做其中一个端的 app，特意分为 2 个插件，减小安装包体积。[android 端请点击这里](https://ext.dcloud.net.cn/plugin?id=976)。[iOS 端请点击这里](https://ext.dcloud.net.cn/plugin?id=1081)。

#### <u>1、前言</u>

最近在使用 uniapp 开发项目，有刷脸实名认证的需求，最终使用百度人脸识别实现了需求。自己做了个 APP 原生插件，给大家介绍下用法。本插件主要功能是通过动作检测活体，采集人脸返回。其他功能需要自主实现，如刷脸登录，实名认证等。

#### <u>2、包名及签名证书准备</u>

包名安卓和 iOS 可填写一样的：com.longyoung.baidudemo（一般用反域名，如我的域名：www.longyong.com）。<font color=red>注意：uniapp 打包或者打基座要用这个包名。</font>申请百度授权文件，需要用到安卓签名证书的 md5，如果你们公司有原生开发团队，问他们要即可。没有的话，自己生成一个签名证书并获取它的 md5，[点击查看方法](https://juejin.im/post/5df4acbaf265da33bd497a55)。<font color=red>注意：uniapp 打包或者打基座要用这个签名证书。</font>

#### <u>3、百度官方资料准备</u>

百度人脸识别申请授权文件步骤要领，[点击查看方法](https://juejin.im/post/5df6cb235188251251353276)。

#### <u>4、接入步骤</u>

4.1 在项目根目录创建文件夹 nativeplugins，购买插件（建议测试版本点击购买下方的试用，正式发布的时候再购买）。

4.2 将百度授权文件 License 放到安卓：nativeplugins/longyoung-BDFaceAuth/android/assets/idl-license.face-android；iOS：nativeplugins/longyoung-BDFaceAuth-iOS/ios/idl-license.face-ios。没路径的请自行创建，nativeplugins 文件夹在项目根目录下。`注意 iOS 没有 assets 文件夹，直接放到 ios 文件夹下。`

![uniapp1.png](https://i.loli.net/2019/12/16/HEUw8KdxAXZbN57.png)

4.3 manifest.json 文件，选中「App原生插件配置」，选中云端插件，勾选插件 longyoung-BDFaceAuth 和 longyoung-BDFaceAuth-iOS。

![uniapp2.png](https://i.loli.net/2019/12/16/BjhaqgGvdJt1lPF.png)

4.4 调用插件，需要传入 licenseID（必传，百度上的 License ID），动作控制参数 actionAry（选传，不传只采集脸，没有动作），动作是否随机参数 isLivenessRandom（选传），是否有声音参数 isSound（选传，iOS 不支持），文字颜色 txtColor（选传），背景颜色 bgColor（选传，iOS 无效），圆的颜色 roundColor（选传），代码如下：

```
<script>
	// #ifdef APP-PLUS
	const lyBDFaceAuth = uni.requireNativePlugin('longyoung-BDFaceAuth'); //android
	const lyBDFaceAuthIOS = uni.requireNativePlugin('longyoung-BDFaceAuth-iOS'); //ios
	// #endif
	export default {
		data() {
			return {
				title: ''
			}
		},
		methods: {
			onScanFace() {
				console.error("tagg.onScanFace");
				
				if (uni.getSystemInfoSync().platform == "android") {//安卓
					lyBDFaceAuth.scanFace({
						licenseID:"longyoung-face-android",//必须与百度授权资料一致
						actionAry:["Eye", "Mouth", "HeadLeft", "HeadRight", "HeadLeftOrRight", "HeadUp", "HeadDown"],//不传无动作
						isLivenessRandom:0,//不传默认有序，0有序，1随机
						isSound:0,//不传默认有声音，0无声，1有声，iOS无效
						txtColor:"#3987FD",//文字颜色
						bgColor:"#3987FD", //背景颜色，iOS设置无效，需要换图片facecover_new.png，路径 nativeplugins\longyoung-BDFaceAuth-iOS\ios\com.baidu.idl.face.faceSDK.bundle，具体看示例。
						roundColor:"#3987FD"//圆的颜色
					}, result => {
						console.log('file://' + result.imgPath);
						
						//图片上传服务器
						uni.uploadFile({
							url:'http://api.longyoung.com/api/open/common/uploadImgTemp',//图片上传地址
							filePath: 'file://' + result.imgPath,//图片本地路径，上传服务器需要加这个头'file://'
							method: 'post',
							name: 'imgFile',//上传图片参数名
							success: (res) => {
								var data = res.data;
							}
						});
						
						//***有些同学反馈，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。
						var bitmapT = new plus.nativeObj.Bitmap("test"); //test标识谁便取
						// 从本地加载Bitmap图片
						bitmapT.load(result.imgPath, function() {
							console.log('加载图片成功');
							var base4 = bitmapT.toBase64Data();
							console.log('lygg.base64=' + base4);
						}, function(e) {
							console.log('加载图片失败：' + JSON.stringify(e));
						});
						//***有些同学反馈，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。
						
					});
				}
				else if (uni.getSystemInfoSync().platform == "ios") {//苹果
					lyBDFaceAuthIOS.scanFace({
						licenseID: "longyoung-face-ios",//必须与百度授权资料一致
						actionAry:["Eye", "Mouth", "HeadLeft", "HeadRight", "HeadLeftOrRight", "HeadUp", "HeadDown"],//不传无动作
						isLivenessRandom:0,//不传默认有序，0有序，1随机
						isSound:0,//不传默认有声音，0无声，1有声，iOS无效
						txtColor:"#3987FD",//文字颜色
						bgColor:"#3987FD", //背景颜色，iOS设置无效，需要换图片facecover_new.png，路径 nativeplugins\longyoung-BDFaceAuth-iOS\ios\com.baidu.idl.face.faceSDK.bundle，具体看示例。
						roundColor:"#3987FD"//圆的颜色
					}, result => {
						console.log('result=' + result);//图片存在 result.bestImgBase64，显示图片需要加头"data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, "")
						
						//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。
						var bitmapT = new plus.nativeObj.Bitmap('test');
						//加载base64图片
						bitmapT.loadBase64Data(result.bestImgBase64, function(res){
							//保存base64图片
							bitmapT.save("_faceImg/face.png", {}, function(res){
								bitmapT.clear();//销毁bitmap对象
								
								//上传图片
								//TODO 使用 uni.uploadFile()上传服务器，filePath=res.target
								
							}, function(res){
								console.log("longyoung.save.fail=", res);
							});
							
						}, function(res){
							console.log("longyoung.fail=", res);
						});
						//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。

					});
				}
				
				
			},
		}
	}
</script>
```

4.5 图片更换

在对应目录放相应图片（如：close_new.png，success_new.png，warning_new.png），不放使用默认图片，详情可看示例代码。

4.6 打自定义基座（以安卓为例，iOS 类似）

需要打自定义基座才可以进行测试，运行->运行到手机或模拟器->制作自定义基座。注意事项看图片，请使用自己的证书（就是签名文件.jks），申请百度授权文件的时候填写这个证书的 md5。`每次打自定义基座的时候，最好先把旧的基座删除（如果存在），路径在根目录下的 unpackage 文件夹里面(LyBDFaceAuthDemo\unpackage\debug\android_debug.apk)。`  

![](https://i.loli.net/2019/12/17/aPirXvBcmCY2s9w.png)  

![uni7.png](https://i.loli.net/2019/12/10/VqbN6J82WpeEFPY.png)

4.7 勾选自定义基座后运行

运行->运行到手机或模拟器->运行基座选择，勾选自定义调试基座，之后运行到设备，如下图。

![uni8.png](https://i.loli.net/2019/12/10/SGBO2TIFHl3NQ1j.png)

#### <u>5、注意事项</u>

5.1 安卓图片存到本地缓存目录，/storage/emulated/0/Android/data/com.longyoung.facedemo/cache/faceImg/face1573781316334.png，上传服务器需要加这个头'file://'。如需要传base64格式，请看上面示例代码。

5.2 iOS 返回的图片为base64格式，请看上面示例代码。

#### <u>6、版权声明</u>

版权归开发者所有。
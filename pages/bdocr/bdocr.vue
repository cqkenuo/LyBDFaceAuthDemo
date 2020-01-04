<!-- @author longyoung http://www.html5plus.org/doc/zh_cn/nativeobj.html-->
<template>
	<view class="content">

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">OCR的类型</view>
		<input v-model="type" class="margin-l-r" placeholder="请输入" />

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">accuracy</view>
		<input v-model="accuracy" class="margin-l-r" placeholder="请输入" />

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">是否检测图像朝向</view>
		<radio-group @change="onChange1" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r11" checked="true" />不检测</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r12" />检测</label>
		</radio-group>
		
		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">是否自动拍照</view>
		<radio-group @change="onChange2" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r21" checked="true" />手动</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r22" />自动</label>
		</radio-group>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onStart()">开始</button>
		</view>

		<image class="" style="width: 300rpx;height: 300rpx;" :src="imgBase64Str"></image>

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;width: 700rpx;word-break:break-all;">{{resultStr}}</view>

	</view>
</template>

<script>
	import permijs from '../../utiles/permission.js'

	var lyBDOCR;

	export default {
		data() {
			return {
				type: 'IDCardFront',
				accuracy: 'auto',
				detectDirection: 0,
				isAutoTakePhoto: 0,

				resultStr: "",
				imgBase64Str: ""
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			if (uni.getSystemInfoSync().platform == "ios") {
				//引用插件
				lyBDOCR = uni.requireNativePlugin('longyoung-BDOCR'); //ios

				//权限
				// this.judgeIosPermission('camera');//相机

			} else if (uni.getSystemInfoSync().platform == "android") {
				//引用插件
				lyBDOCR = uni.requireNativePlugin('longyoung-BDOCR'); //android

				//权限
				this.requestAndroidPermission('android.permission.CAMERA'); //相机
				// this.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE');//外部存储(含相册)读取权限
				// this.requestAndroidPermission('android.permission.WRITE_EXTERNAL_STORAGE');//外部存储(含相册)写入权限

			}
			// #endif
		},
		methods: {
			//刷脸
			onStart() {
				console.error("tagg.onStart");

				self = this;

				if (uni.getSystemInfoSync().platform == "android") { //安卓
					lyBDOCR.startOCRLy({
						type: this.type, //IDCardFront 身份证正面、IDCardBack 身份证反面、bankCard 银行卡、passport 护照
						accuracy: this.accuracy, //支持这三个字符串：auto、normal、high，精准度，精度越高，速度越慢。default：auto
						detectDirection: this.detectDirection,//是否检测图像朝向，0不检测，1检测
						isAutoTakePhoto:this.isAutoTakePhoto//仅身份证有效，是否自动拍照，0手动，1自动
					}, result => {
						console.log('result=' + result);
						self.resultStr = "返回结果：\n" + JSON.stringify(result);
						// self.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片


						//***有些同学，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。
						var bitmapT = new plus.nativeObj.Bitmap("test"); //test标识随便取
						// 从本地加载Bitmap图片
						if (result.imgPath) {
							bitmapT.load(result.imgPath, function() {
								console.log('加载图片成功');
								var base4 = bitmapT.toBase64Data();
								console.log('lygg.base64=' + base4);
								self.resultStr = self.resultStr + "\n======base64字符串（太长，截取前100字符）：\n" + base4.substring(0, 100);
								self.imgBase64Str = base4.replace(/[\r\n]/g, ""); //显示图片
							}, function(e) {
								console.log('加载图片失败：' + JSON.stringify(e));
							});
						} 
						else if (self.imgBase64Str) {
							self.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片
						}
						//***有些同学，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。


					});
				} else if (uni.getSystemInfoSync().platform == "ios") { //苹果
					lyBDOCR.startOCRLy({
						type: this.type, //IDCardFront、IDCardBack、bankCard、passport、general
						accuracy: this.accuracy, //支持这三个字符串：auto、normal、high，精准度，精度越高，速度越慢。default：auto
						detectDirection: this.detectDirection,//是否检测图像朝向，0不检测，1检测
						isAutoTakePhoto:this.isAutoTakePhoto//仅身份证有效，是否自动拍照，0手动，1自动
					}, result => {
						console.log('result=' + result);
						self.resultStr = "返回结果（太长，截取前100字符）：\n" + JSON.stringify(result).substring(0, 100);
						self.resultStr = self.resultStr + "\n======base64字符串（太长，截取前100字符）：\n" + result.bestImgBase64.substring(0, 100);
						// self.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片

						//***有些同学，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。
						var bitmapT = new plus.nativeObj.Bitmap("test"); //test标识随便取
						// 从本地加载Bitmap图片
						if (result.imgPath) {
							bitmapT.load(result.imgPath, function() {
								console.log('加载图片成功');
								var base4 = bitmapT.toBase64Data();
								console.log('lygg.base64=' + base4);
								self.resultStr = self.resultStr + "\n======base64字符串（太长，截取前100字符）：\n" + base4.substring(0, 100);
								self.imgBase64Str = base4.replace(/[\r\n]/g, ""); //显示图片
							}, function(e) {
								console.log('加载图片失败：' + JSON.stringify(e));
							});
						} 
						else if (self.imgBase64Str) {
							self.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片
						}
						//***有些同学，后台强烈要求传base64，下面是图片转base64的方法，没此需求的可以无视。

					});
				}

			},


			//朝向绑定
			onChange1: function(e) {
				console.log(e.detail.value == 'r11');
				if (e.detail.value == 'r11') {
					this.detectDirection = 0;
				} else if (e.detail.value == 'r12') {
					this.detectDirection = 1;
				}
			},
			//自动拍照绑定
			onChange2: function(e) {
				console.log(e.detail.value == 'r21');
				if (e.detail.value == 'r21') {
					this.isAutoTakePhoto = 0;
				} else if (e.detail.value == 'r22') {
					this.isAutoTakePhoto = 1;
				}
			},

			//权限
			async requestAndroidPermission(permisionID) {
				var result = await permijs.requestAndroidPermission(permisionID);
				var strStatus;
				if (result == 1) {
					strStatus = "已获得授权";
				} else if (result == 0) {
					strStatus = "未获得授权";
					uni.showToast({
						title: "请打开权限，否则无法使用",
						icon: 'none'
					});
				} else {
					strStatus = "被永久拒绝权限";
					permijs.gotoAppPermissionSetting();
					uni.showToast({
						title: '请打开权限，否则无法使用',
						icon: 'none'
					});
				}
				console.log("lygg.strStatus=" + strStatus + ",result=" + result);
			},
			judgeIosPermission: function(permisionID) {
				var result = permijs.judgeIosPermission(permisionID)
				if (result) {} else {
					permijs.gotoAppPermissionSetting();
					uni.showToast({
						title: '请打开权限，否则无法使用',
						icon: 'none'
					});
				}
				console.log("lygg.result=" + result);
			},
		}
	}
</script>

<style>
	.content {
		width: 100%;
		/* padding: 20rpx; */
	}

	button {
		margin-top: 30rpx;
		margin-bottom: 30rpx;
	}

	.button-sp-area {
		margin: 0 auto;
		width: 60%;
	}

	.c-hint {
		color: #808080;
	}

	.margin-l-r {
		margin-left: 20rpx;
		margin-right: 20rpx;
	}

	.uni-list-cell {
		justify-content: flex-start
	}

	/* 列表 */
	.uni-list {
		background-color: #FFFFFF;
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.uni-list:after {
		position: absolute;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list::before {
		position: absolute;
		z-index: 10;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.uni-list-cell-hover {
		background-color: #eee;
	}

	.uni-list-cell-pd {
		padding: 22upx 30upx;
	}

	.uni-list-cell-left {
		font-size: 28upx;
		padding: 0 30upx;
	}

	.uni-list-cell-db,
	.uni-list-cell-right {
		flex: 1;
	}

	.uni-list-cell::after {
		position: absolute;
		z-index: 3;
		right: 0;
		bottom: 0;
		left: 30upx;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list .uni-list-cell:last-child::after {
		height: 0upx;
	}

	.uni-list-cell-last.uni-list-cell::after {
		height: 0upx;
	}

	.uni-list-cell-divider {
		position: relative;
		display: flex;
		color: #999;
		background-color: #f7f7f7;
		padding: 15upx 20upx;
	}

	.uni-list-cell-divider::before {
		position: absolute;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell-divider::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0upx;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}

	.uni-list-cell-navigate {
		font-size: 30upx;
		padding: 22upx 30upx;
		line-height: 48upx;
		position: relative;
		display: flex;
		box-sizing: border-box;
		width: 100%;
		flex: 1;
		justify-content: space-between;
		align-items: center;
	}

	.uni-list-cell-navigate {
		padding-right: 36upx;
	}

	.uni-navigate-badge {
		padding-right: 50upx;
	}

	.uni-list-cell-navigate.uni-navigate-right:after {
		font-family: uniicons;
		content: '\e583';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-list-cell-navigate.uni-navigate-bottom:after {
		font-family: uniicons;
		content: '\e581';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-list-cell-navigate.uni-navigate-bottom.uni-active::after {
		font-family: uniicons;
		content: '\e580';
		position: absolute;
		right: 24upx;
		top: 50%;
		color: #bbb;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);
	}

	.uni-collapse.uni-list-cell {
		flex-direction: column;
	}

	.uni-list-cell-navigate.uni-active {
		background: #eee;
	}

	.uni-list.uni-collapse {
		box-sizing: border-box;
		height: 0;
		overflow: hidden;
	}

	.uni-collapse .uni-list-cell {
		padding-left: 20upx;
	}

	.uni-collapse .uni-list-cell::after {
		left: 52upx;
	}

	.uni-list.uni-active {
		height: auto;
	}
</style>

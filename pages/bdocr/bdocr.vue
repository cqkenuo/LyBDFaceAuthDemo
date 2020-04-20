<!-- @author longyoung http://www.html5plus.org/doc/zh_cn/nativeobj.html-->
<template>
	<view class="content">
		
		<view class="c-hint margin-l-r" style="margin-top: 10rpx;margin-bottom: 50rpx;color: #ff0000;font-size: 24rpx;">Tips：返回结果在页尾打印展示。</view>

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

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">是否自动拍照（仅身份证有效）</view>
		<radio-group @change="onChange2" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r21" checked="true" />手动</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r22" />自动</label>
		</radio-group>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onStartBtn()">开始</button>
		</view>

		<image class="" style="width: 300rpx;height: 300rpx;" :src="imgBase64Str"></image>

		<view class="c-hint margin-l-r text-wrapper" style="margin-top: 30rpx;width: 700rpx;word-break:break-all;">{{resultStr}}</view>

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
				bestImgBase64Str: undefined,
				imgBase64Str: ""
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			if (uni.getSystemInfoSync().platform == "ios") {
				//权限
				// this.judgeIosPermission('camera');//相机
			} else if (uni.getSystemInfoSync().platform == "android") {
				//权限
				this.requestAndroidPermission('android.permission.CAMERA'); //相机
				// this.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE');//外部存储(含相册)读取权限
				// this.requestAndroidPermission('android.permission.WRITE_EXTERNAL_STORAGE');//外部存储(含相册)写入权限
			}
			//引用插件
			lyBDOCR = uni.requireNativePlugin('longyoung-BDOCR');
			// #endif
		},
		methods: {
			//开始
			onStartBtn() {
				console.error("lygg.onStartBtn");
				
				// #ifndef APP-PLUS
				uni.showToast({
					icon:'none',
					title:'请使用真机测试'
				})
				return;
				// #endif

				let that = this;

				lyBDOCR.startOCRLy({
					//type
					//IDCardFront 身份证正面识别、IDCardBack 身份证反面识别、bankCard 银行卡识别、passport 护照识别。
					//105通用文字识别（含位置信息版）、106通用文字识别、107通用文字识别(高精度版)、108通用文字识别（含位置信息高精度版）、109通用文字识别（含生僻字版）
					//110网络图片识别、120行驶证识别、121驾驶证识别、122车牌识别、123营业执照识别、124通用票据识别、126数字识别、127二维码识别
					//128名片识别、129手写文字识别、130彩票识别、131增值税发票识别、132自定义模板
					type: this.type,
					accuracy: this.accuracy, //支持这三个字符串：auto、normal、high，精准度，精度越高，速度越慢。default：auto
					// detectDirection: this.detectDirection,//是否检测图像朝向，0不检测，1检测
					isAutoTakePhoto: this.isAutoTakePhoto //仅身份证有效，是否自动拍照，0手动，1自动
				}, result => {
					console.log('result.all=' + JSON.stringify(result)); //返回结果全部打印
					if (result.bestImgBase64) {
						that.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片
						that.bestImgBase64Str = result.bestImgBase64;
						that.resultStr = that.resultStr + "\n======base64字符串（太长，截取前200字符）：\n" + result.bestImgBase64.substring(0, 200);
						delete result.bestImgBase64; //删除bestImgBase64
					}
					that.resultStr = that.resultStr + "\n======不包含图片部分：\n" + JSON.stringify(result);
					console.log('result.noImg=' + JSON.stringify(result)); //返回结果，不含图片打印

					//关闭页面，status=0 且 err_code=0，检测超时，仅安卓有效，iOS 无超时的说法
					if (result.status == 0) {
						if (result.err_code == 0) {
							lyBDFaceAuth.closeAty({}, result => {
								console.log('result.closeAty=' + JSON.stringify(result));
							});
						}
					}

					//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。
					//https://ask.dcloud.net.cn/question/30546, https://ask.dcloud.net.cn/question/76827
					//http://www.html5plus.org/doc/zh_cn/io.html#plus.io.URLType, https://ask.dcloud.net.cn/article/94
					if (that.bestImgBase64Str) {
						var bitmapT = new plus.nativeObj.Bitmap('test');
						//加载base64图片
						bitmapT.loadBase64Data(that.bestImgBase64Str, function(res) {
							console.log("longyoung.loadBase64Data.suc=" + JSON.stringify(res));
							//保存base64图片，请不要私自改变 _doc/ 除非你明确的知道 Bitmap.save() 的用法。
							bitmapT.save("_doc/face.png", {}, function(res) {
								bitmapT.clear(); //销毁bitmap对象
								console.log("longyoung.save.suc=" + JSON.stringify(res));

								//图片上传服务器
								uni.uploadFile({
									url: 'http://api.longyoung.com/api/open/common/uploadImgTemp', //图片上传地址，填你们自己的，详情查看 uni.uploadFile(OBJECT) 这个 api。
									filePath: res.target,
									method: 'post',
									name: 'imgFile', //上传图片参数名，填你们自己的，详情查看 uni.uploadFile(OBJECT) 这个 api。
									success: (res) => {
										var data = res.data;
									},
									fail: (res) => {
										console.log("longyoung.uploadFile.fail=", res);
										// uni.showToast({
										// 	title:'图片上传错误',
										// 	icon:'none'
										// })
									}
								});

							}, function(res) {
								console.log("longyoung.save.fail=", res);
								uni.showModal({
									title: 'bitmap保存错误',
									content: JSON.stringify(res)
								});
							});

						}, function(res) {
							console.log("longyoung.fail=", res);
							uni.showModal({
								title: 'base64转bitmap错误',
								content: JSON.stringify(res)
							});
						});
					}
					//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。



				});


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

	/*换行*/
	.text-wrapper {
		white-space: pre-wrap;
	}
</style>

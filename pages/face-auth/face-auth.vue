<!-- @author longyoung http://www.html5plus.org/doc/zh_cn/nativeobj.html-->
<template>
	<view class="content">

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">licenseID</view>
		<input v-model="licenseIDStr" class="margin-l-r" placeholder="请输入" />

		<view class="c-hint margin-l-r" style="margin-top: 30rpx">动作</view>
		<view class="uni-list" style="margin-top: 10rpx;margin-bottom: 30rpx;">
			<checkbox-group @change="checkboxChange">
				<label class="uni-list-cell uni-list-cell-pd" v-for="item in items" :key="item.value">
					<view>
						<checkbox :value="item.value" :checked="item.checked" />{{item.name}}
					</view>
				</label>
			</checkbox-group>
		</view>

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">动作是否按顺序执行</view>
		<radio-group @change="onChange1" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r11" checked="true" />有序</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r12" />随机</label>
		</radio-group>

		<view class="c-hint margin-l-r" style="margin-top: 30rpx">是否有声音</view>
		<radio-group @change="onChange2" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r21" checked="true" />有声音</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r22" />无声音</label>
		</radio-group>
		
		<view class="c-hint margin-l-r" style="margin-top: 30rpx">前后摄像头</view>
		<radio-group @change="onChange3" class="margin-l-r">
			<label class="">
				<radio style="transform: scale(0.7);" value="r31" checked="true" />前置摄像头</label>
			<label class="ml-30">
				<radio style="transform: scale(0.7);" value="r32" />后置摄像头</label>
		</radio-group>

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">文字颜色</view>
		<input v-model="txtColor" class="margin-l-r" placeholder="请输入" />

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">背景颜色</view>
		<input v-model="bgColor" class="margin-l-r" placeholder="请输入" />

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;">圆的颜色</view>
		<input v-model="roundColor" class="margin-l-r" placeholder="请输入" />

		<!-- <view class="c-hint margin-l-r" style="margin-top: 30rpx;">zoom的值</view>
		<input v-model="zoom" class="margin-l-r" placeholder="请输入" /> -->

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onScanFace()">开始活体采集</button>
		</view>

		<image class="" style="width: 300rpx;height: 300rpx;" :src="imgBase64Str"></image>

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;width: 700rpx;word-break:break-all;">{{resultStr}}</view>

	</view>
</template>

<script>
	import permijs from '../../utiles/permission.js'

	var lyBDFaceAuth;
	// var lyBDFaceAuthIOS;

	export default {
		data() {
			return {
				licenseIDStr: 'longyoung-face-android',
				items: [{
						value: 'Eye',
						name: '眨眨眼',
						checked: 'true'
					},
					{
						value: 'Mouth',
						name: '张张嘴',
						checked: 'true'
					},
					{
						value: 'HeadLeft',
						name: '向左转头'
					},
					{
						value: 'HeadRight',
						name: '向右转头'
					},
					{
						value: 'HeadLeftOrRight',
						name: '左右摇头'
					},
					{
						value: 'HeadUp',
						name: '缓慢抬头'
					},
					{
						value: 'HeadDown',
						name: '缓慢低头'
					}
				],
				isLivenessRandom: 0,
				isSound: 1,
				frontBack: 0,
				txtColor: '#3987FD',
				bgColor: '#2F2F33',
				roundColor: '#3987FD',
				zoom: 0.75,//圆圈里的影像有黑边才传，没问题不要传（代码已适配，有些机型没测试到才会有问题），仅ios有效，iPhone0.7,iPad0.9

				resultStr: "",
				imgBase64Str: ""
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			if (uni.getSystemInfoSync().platform == "ios") {
				//权限
				// this.judgeIosPermission('camera');//相机
				
				this.licenseIDStr = "longyoung-face-ios";
			} else if (uni.getSystemInfoSync().platform == "android") {
				//权限
				this.requestAndroidPermission('android.permission.CAMERA'); //相机
				// this.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE');//外部存储(含相册)读取权限
				// this.requestAndroidPermission('android.permission.WRITE_EXTERNAL_STORAGE');//外部存储(含相册)写入权限
				
				this.licenseIDStr = "longyoung-face-android";
			}
			
			//引用插件
			lyBDFaceAuth = uni.requireNativePlugin('longyoung-BDFaceAuth'); 
			// #endif
		},
		methods: {
			//刷脸
			onScanFace() {
				console.error("tagg.onScanFace");

				let that = this;

				var ary = [];
				for (var i = 0; i < this.items.length; i++) {
					var item = this.items[i];
					if (item.checked) {
						ary[i] = item.value;
					}
				}

				lyBDFaceAuth.scanFace({
					licenseID: this.licenseIDStr, //安卓，iOS后缀不一样
					actionAry: ary, //不传无动作
					isLivenessRandom: this.isLivenessRandom, //不传默认有序，0有序，1随机
					isSound: this.isSound, //不传默认有声音，0无声，1有声，iOS设置无效
					frontBack: this.frontBack, //不传默认前置，0前置，1后置
					txtColor: this.txtColor, //文字颜色
					bgColor: this.bgColor, //背景颜色，iOS设置无效，需要换图片facecover_new.png，路径 nativeplugins\longyoung-BDFaceAuth-iOS\ios\com.baidu.idl.face.faceSDK.bundle，具体看示例。
					roundColor: this.roundColor //圆的颜色
				}, result => {


					//模拟登录
					uni.showLoading({
						mask:true,
						title:"登录中"
					});
					let timeoutId = setTimeout(function() {
						uni.hideLoading();
						uni.showToast({
							title:"登录成功",
							icon:"none"
						})
						clearTimeout(timeoutId);
					}, 2*1000);
					//模拟登录
					
					
					
					console.log('result=' + JSON.stringify(result));//图片存在 result.bestImgBase64，显示图片需要加头"data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, "")
					that.resultStr = "返回结果（太长，截取前200字符）：\n" + JSON.stringify(result).substring(0, 200);
					that.resultStr = that.resultStr + "\n======base64字符串（太长，截取前200字符）：\n" + result.bestImgBase64.substring(0, 200);
					that.imgBase64Str = "data:image/png;base64," + result.bestImgBase64.replace(/[\r\n]/g, ""); //显示图片
				
				
					//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。
					//https://ask.dcloud.net.cn/question/30546, https://ask.dcloud.net.cn/question/76827
					//http://www.html5plus.org/doc/zh_cn/io.html#plus.io.URLType, https://ask.dcloud.net.cn/article/94
					var bitmapT = new plus.nativeObj.Bitmap('test');
					//加载base64图片
					bitmapT.loadBase64Data(result.bestImgBase64, function(res) {
						console.log("longyoung.loadBase64Data.suc=" + JSON.stringify(res));
						//保存base64图片
						bitmapT.save("_doc/face.png", {}, function(res) {
							bitmapT.clear(); //销毁bitmap对象
							console.log("longyoung.save.suc=" + JSON.stringify(res));
				
							//图片上传服务器
							uni.uploadFile({
								url: 'http://api.longyoung.com/api/open/common/uploadImgTemp', //图片上传地址
								filePath: res.target,
								method: 'post',
								name: 'imgFile', //上传图片参数名
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
								title:'bitmap保存错误',
								content:JSON.stringify(res)
							});
						});
				
					}, function(res) {
						console.log("longyoung.fail=", res);
						uni.showModal({
							title:'base64转bitmap错误',
							content:JSON.stringify(res)
						});
					});
					//***不传base64的，看这里，使用 uni.uploadFile()上传服务器，没此需求的可以无视。
				
				});
				
				

			},


			//动作绑定
			checkboxChange: function(e) {
				var items = this.items,
					values = e.detail.value;
				for (var i = 0, lenI = items.length; i < lenI; ++i) {
					const item = items[i]
					if (values.includes(item.value)) {
						this.$set(item, 'checked', true)
					} else {
						this.$set(item, 'checked', false)
					}
				}
			},
			//顺序绑定
			onChange1: function(e) {
				console.log(e.detail.value == 'r11');
				if (e.detail.value == 'r11') {
					this.isLivenessRandom = 0;
				} else if (e.detail.value == 'r12') {
					this.isLivenessRandom = 1;
				}
			},
			//声音绑定
			onChange2: function(e) {
				console.log(e.detail.value == 'r21');
				if (e.detail.value == 'r21') {
					this.isSound = 1;
				} else if (e.detail.value == 'r22') {
					this.isSound = 0;
				}
			},
			//摄像头绑定
			onChange3: function(e) {
				console.log(e.detail.value == 'r31');
				if (e.detail.value == 'r31') {
					this.frontBack = 0;
				} else if (e.detail.value == 'r32') {
					this.frontBack = 1;
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

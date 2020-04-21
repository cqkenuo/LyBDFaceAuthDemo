<!-- @author longyoung http://www.html5plus.org/doc/zh_cn/nativeobj.html-->
<template>
	<view class="content">

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onInitBtn()">初始化支付</button>
		</view>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onInitKeybordBtn()">初始化键盘</button>
		</view>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onSetListenerDetectorBtn()">设置Detector监听</button>
		</view>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onSetListenerKeyboardBtn()">设置键盘监听</button>
		</view>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onOpenKeyboardLyBtn()">打开键盘</button>
		</view>

		<!-- <view class="c-hint margin-l-r" style="margin-top: 30rpx;">OCR的类型</view>
		<input v-model="type" class="margin-l-r" placeholder="请输入" /> -->

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onRawBtn()">获取 rawdata</button>
		</view>

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onPayBtn()">支付</button>
		</view>

		<image class="" style="width: 300rpx;height: 300rpx;" :src="imgBase64Str"></image>

		<view class="c-hint margin-l-r text-wrapper" style="margin-top: 30rpx;width: 700rpx;word-break:break-all;">{{resultStr}}</view>

	</view>
</template>

<script>
	import permijs from '../../utiles/permission.js'
	import md5js from '../../utiles/md5.js'

	//键盘，初始化成功，再设置监听。设置监听成功，再打开键盘。

	var longyoungWXFacePay;

	export default {
		data() {
			return {
				resultStr: "",
				imgBase64Str: "",

				authinfo: '',
				out_trade_no: '',

				payMoney: ''
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
			longyoungWXFacePay = uni.requireNativePlugin('longyoung-WXFacePay');
			// #endif
		},
		methods: {
			onInitBtn() {
				console.log('onInitBtn');
				let that = this;
				longyoungWXFacePay.initWxpayfaceLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					///test
					setTimeout(function() {
						console.log("lygg.setTimeout1");
					}, 5000);

					if (result && result.return_code == 'SUCCESS') {
						uni.showToast({
							icon: 'none',
							title: '初始化支付成功'
						})
					}
				});
			},
			onInitKeybordBtn() {
				console.log('onInitKeybordBtn');
				let that = this;
				longyoungWXFacePay.initKeyboardLy({
					layout: '0',
					baudRate: '9600'
				}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result && result.return_code == 'SUCCESS') {
						uni.showToast({
							icon: 'none',
							title: '初始化键盘成功'
						})
					}
				});
			},
			onSetListenerDetectorBtn() {
				console.log('onSetListenerDetectorBtn');
				let that = this;
				longyoungWXFacePay.setListenerDetectorLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result) {
						if (result.return_code == 'SUCCESS') {
							if (result.listener_type == 'onAttach') {
								uni.showToast({
									icon: 'none',
									title: '键盘插入'
								})

								//中途插入，来一遍键盘流程
								that.onInitKeybordBtn();
								that.onSetListenerKeyboardBtn();
								that.onOpenKeyboardLyBtn();
							}
							uni.showToast({
								icon: 'none',
								title: '初始化Detector成功'
							})
						} else if (result.return_code == 'ERROR') {
							uni.showToast({
								icon: 'none',
								title: 'detector is null'
							})
						}
					}
				});
			},
			onSetListenerKeyboardBtn() {
				console.log('onSetListenerKeyboardBtn');
				let that = this;
				longyoungWXFacePay.setListenerKeyboardLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result) {
						if (result.return_code == 'SUCCESS') {
							if (result.listener_type == 'onRelease') {
								uni.showToast({
									icon: 'none',
									title: '键盘释放'
								})
							} else if (result.listener_type == 'onAvailable') {
								that.updateSignalKeyboardLy();
								uni.showToast({
									icon: 'none',
									title: '键盘可用'
								})
							} else if (result.listener_type == 'onPay') {
								uni.showToast({
									icon: 'none',
									title: '点击支付'
								})
								that.payMoney = result.listener_money;

								that.onPayBtn(); //调支付
							} else if (result.listener_type == 'onKeyDown') {
								uni.showToast({
									icon: 'none',
									title: '' + result.key_name
								})
							} else if (result.listener_type == 'onKeyUp') {}

							uni.showToast({
								icon: 'none',
								title: '监听设置成功'
							})
						} else if (result.return_code == 'ERROR') {
							if (result.listener_type == 'onException') {
								uni.showToast({
									icon: 'none',
									title: '键盘异常'
								})
							}
						}
					}

				});
			},
			updateSignalKeyboardLy() {
				let that = this;
				longyoungWXFacePay.updateSignalKeyboardLy({
					wifi: '4',
					gprs: '0'
				}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result && result.return_code == 'SUCCESS') {
						uni.showToast({
							icon: 'none',
							title: 'updateSignalKeyboardLy 成功'
						})
					}
				});
			},
			onOpenKeyboardLyBtn() {
				console.log('onOpenKeyboardLyBtn');
				let that = this;
				longyoungWXFacePay.openKeyboardLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result && result.return_code == 'SUCCESS') {
						uni.showToast({
							icon: 'none',
							title: '键盘打开成功'
						})
					}
				});
			},

			onRawBtn() {
				console.log('onRawBtn');
				let that = this;
				longyoungWXFacePay.getWxpayfaceRawdataLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					console.log("lygg.creat=" + result.plugin_creator);
					console.log("lygg.rawdata=" + result.rawdata);
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					if (result && result.return_code == 'FAIL') {
						uni.showToast({
							icon: 'none',
							title: '获取 raw 失败'
						})
					}

					that.postFaceAuthInfo(result.rawdata);
				});
			},
			onPayBtn() {
				console.log('onPayBtn');
				let that = this;

				let money = Number(that.payMoney);
				if (money <= 0) {
					uni.showToast({
						icon: 'none',
						title: '请输入金额'
					})
				}
				money = money * 100;

				longyoungWXFacePay.getWxpayfaceCodeLy({
					face_authtype: 'FACEPAY',
					appid: '你的',///diff wx032f************
					mch_id: '你的',///diff 149*******
					sub_mch_id: '你的',///diff 154*******
					store_id: '11',
					total_fee: money + '',
					face_code_type: '0',
					authinfo: that.authinfo,
					out_trade_no: that.out_trade_no,
				}, result => {
					console.log('result=' + JSON.stringify(result));
					that.resultStr += '\n' + JSON.stringify(result) + '\n';

					let info = result;
					if (info && info.face_code) {
						let faceCode = info.face_code; // 人脸凭证，用于刷脸支付
						let openid = info.openid; // openid
						that.postPay(faceCode, openid, money);
					} else {
						uni.showToast({
							icon: 'none',
							title: 'face_code 获取失败'
						})
						return;
					}

					///2 秒后查询结果，如不查询，sdk 60 秒读完后会显示失败。
					setTimeout(function() {
						console.log("lygg.setTimeout2");
						longyoungWXFacePay.updateWxpayfacePayResultLy({}, result => {
							console.log('result=' + JSON.stringify(result));
							that.resultStr += '\n' + JSON.stringify(result) + '\n';

							// result.return_code//公共返回码
							// result.err_code//二级错误码，如是 USER_QUERY_CANCEL 表示用户取消查单
							if (result == null || result.return_code != 'SUCCESS') {
								uni.showToast({
									icon: 'none',
									title: '未成功支付'
								})
								//通知键盘支付失败
								longyoungWXFacePay.keyboardSetPayResultLy({
									payResult: '0' //0失败1成功
								}, result => {
									console.log('result=' + JSON.stringify(result));
									that.resultStr += '\n' + JSON.stringify(result) + '\n';
								});
								return;
							}
							/*
							在这里处理您自己的业务逻辑：
							执行到这里说明用户已经确认支付结果且成功了，此时刷脸支付界面关闭，您可以在这里选择跳转到其它界面
							 */
							//通知键盘支付成功
							longyoungWXFacePay.keyboardSetPayResultLy({
								payResult: '1' //0失败1成功
							}, result => {
								console.log('result=' + JSON.stringify(result));
								that.resultStr += '\n' + JSON.stringify(result) + '\n';
							});


						});
					}, 2 * 1000);


				});
			},

			postFaceAuthInfo(rawdataStr) {
				let that = this;

				let data = {
					store_id: '11',
					rawdata: rawdataStr,
					nonce_str: '5d103f27b0e2b'
				};

				//签名
				let rawStr = md5js.raw(data);
				rawStr = rawStr + '&key=' + '你的key';///diff G6XREC****************
				let signStr = md5js.hex_md5(rawStr).toUpperCase(); //MD5加密后转化为大写字符
				console.log('lygg.md5Str=' + signStr);

				// delete data.key; //删除key

				let json = {
					appid: '你的appid',///diff 331*******
					method: 'wx_faceAuthInfo',
					data: data,
					sign: signStr
				};
				console.log("lygg.post.json=" + JSON.stringify(json));

				this.post('', json, true)
					.then(result => {
						console.log('wxface.result=' + JSON.stringify(result));
						console.log('wxface.result.data.msg=' + result.data.msg);

						let data = result.data.data;
						if (data) {
							that.authinfo = data.auth_info;
							that.out_trade_no = data.out_trade_no;
						}

					});
			},
			postPay(faceCode, openId, money) {
				let that = this;
				
				let data = {
					store_id: '11',
					total: money,
					openId: openId,
					faceCode: faceCode,
					out_trade_no: that.out_trade_no,
					nonce_str: '5d103f27b0e2b',
				};

				//签名
				let rawStr = md5js.raw(data);
				rawStr = rawStr + '&key=' + '你的key';///diff G6XREC****************
				let signStr = md5js.hex_md5(rawStr).toUpperCase(); //MD5加密后转化为大写字符
				console.log('lygg.md5Str=' + signStr);

				let json = {
					appid: '你的appid',///diff 331*******
					method: 'wx_facePay',
					data: data,
					sign: signStr
				};
				console.log("lygg.post.json=" + JSON.stringify(json));

				this.post('', json, true)
					.then(result => {
						console.log('postPay.result=' + JSON.stringify(result));
						console.log('postPay.result.data.msg=' + result.data.msg);
					});
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

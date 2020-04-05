<!-- @author longyoung http://www.html5plus.org/doc/zh_cn/nativeobj.html-->
<template>
	<view class="content">

		<view class="button-sp-area">
			<button type="primary" plain="true" @click="onInitBtn()">初始化</button>
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

		<view class="c-hint margin-l-r" style="margin-top: 30rpx;width: 700rpx;word-break:break-all;">{{resultStr}}</view>

	</view>
</template>

<script>
	import permijs from '../../utiles/permission.js'

	var longyoungWXFacePay;

	export default {
		data() {
			return {
				resultStr: "",
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
			longyoungWXFacePay = uni.requireNativePlugin('longyoung-WXFacePay');
			// #endif
		},
		methods: {
			onInitBtn() {
				console.log('onInitBtn');
				longyoungWXFacePay.initWxpayfaceLy({}, result => {
					console.log('result=' + result);
				});
			},
			onRawBtn() {
				console.log('onRawBtn');
				let that = this;
				longyoungWXFacePay.getWxpayfaceRawdataLy({}, result => {
					console.log('result=' + JSON.stringify(result));
					console.log("lygg.creat=" + result.plugin_creator);
					that.postFaceAuthInfoSign(result.rawdata);
				});
			},
			onPayBtn() {
				console.log('onPayBtn');
				longyoungWXFacePay.getWxpayfaceCodeLy({
					face_authtype: 'FACEPAY',
					appid: 'wx032fd2484bb99b79',
					mch_id: '1493440642',
					sub_mch_id: '1541612021',
					store_id: '11',
					total_fee: '1',
					authinfo: 'wx032fd2484bb99b79',
					out_trade_no: 'wx032fd2484bb99b79',
				}, result => {
					console.log('result=' + JSON.stringify(result));
				});
			},

			postFaceAuthInfoSign(str) {
				let that = this;

				let data = {
					store_id: '11',
					rawdata: str,
					nonce_str: '5d103f27b0e2b'

				};

				// let signStr = that.sign(data);
				let signStr = '';
				let dataSign = data;
				dataSign.key = 'G6XREC0FN8JJPHWIS30O8P';
				longyoungWXFacePay.signLy(dataSign, result => {
					console.log('result.sign=' + JSON.stringify(result));
					signStr = result.sign;
					console.log("lygg.sign=" + signStr);
					that.postFaceAuthInfo(signStr, data);
				});
				console.log("lygg.sign2=" + signStr);
				

			},
			postFaceAuthInfo(signStr, data) {
				let that = this;
			
			// 	let data = {
			// 		store_id: '11',
			// 		rawdata: str,
			// 		nonce_str: '5d103f27b0e2b'
			
			// 	};
			
				// let signStr = that.sign(data);
				// let signStr = '';
				// let dataSign = data;
				// dataSign.key = 'G6XREC0FN8JJPHWIS30O8P';
				// longyoungWXFacePay.signLy(dataSign, result => {
				// 	console.log('result.sign=' + JSON.stringify(result));
				// 	signStr = result.sign;
				// });
				// console.log("lygg.sign=" + signStr);
			
				let json = {
					appid: '3315919327',
					method: 'wx_faceAuthInfo',
					data: data,
					sign: signStr
				};
				this.post('', json, true)
					.then(data => {
						console.log('wxface.data=' + JSON.stringify(data));
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
			
			
			///签名相关
			sign(ret) {
				var str = this.raw(ret);
				str = str + '&key=' + 'G6XREC0FN8JJPHWIS30O8P';
				var md5Str = this.hex_md5(str).toUpperCase();
				return md5Str;
			},
			
			raw: function(args) { //排序拼接
				var keys = Object.keys(args);
				keys = keys.sort();
				var newArgs = {};
				keys.forEach(function(key) {
					newArgs[key] = args[key];
				});
			
				var str = '';
				for (var k in newArgs) {
					str += '&' + k + '=' + newArgs[k];
				}
				str = str.substr(1);
				return str;
			},
			
			hex_md5: function(s) {
				return this.rstr2hex(this.rstr_md5(this.str2rstr_utf8(s)));
			},
			
			str2rstr_utf8: function(input) {
				var output = "";
				var i = -1;
				var x, y;
			
				while (++i < input.length) {
					/* Decode utf-16 surrogate pairs */
					x = input.charCodeAt(i);
					y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
					if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
						x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
						i++;
					}
			
					/* Encode output as utf-8 */
					if (x <= 0x7F)
						output += String.fromCharCode(x);
					else if (x <= 0x7FF)
						output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
							0x80 | (x & 0x3F));
					else if (x <= 0xFFFF)
						output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
							0x80 | ((x >>> 6) & 0x3F),
							0x80 | (x & 0x3F));
					else if (x <= 0x1FFFFF)
						output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
							0x80 | ((x >>> 12) & 0x3F),
							0x80 | ((x >>> 6) & 0x3F),
							0x80 | (x & 0x3F));
				}
				return output;
			},
			
			rstr_md5: function(s) {
				return this.binl2rstr(this.binl_md5(this.rstr2binl(s), s.length * 8));
			},
			
			rstr2binl: function(input) {
				var output = Array(input.length >> 2);
				for (var i = 0; i < output.length; i++)
					output[i] = 0;
				for (var i = 0; i < input.length * 8; i += 8)
					output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
				return output;
			},
			
			binl2rstr: function(input) {
				var output = "";
				for (var i = 0; i < input.length * 32; i += 8)
					output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
				return output;
			},
			
			binl_md5: function(x, len) {
				/* append padding */
				x[len >> 5] |= 0x80 << ((len) % 32);
				x[(((len + 64) >>> 9) << 4) + 14] = len;
			
				var a = 1732584193;
				var b = -271733879;
				var c = -1732584194;
				var d = 271733878;
			
				for (var i = 0; i < x.length; i += 16) {
					var olda = a;
					var oldb = b;
					var oldc = c;
					var oldd = d;
			
					a = this.md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
					d = this.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
					c = this.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
					b = this.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
					a = this.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
					d = this.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
					c = this.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
					b = this.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
					a = this.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
					d = this.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
					c = this.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
					b = this.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
					a = this.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
					d = this.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
					c = this.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
					b = this.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
			
					a = this.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
					d = this.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
					c = this.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
					b = this.md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
					a = this.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
					d = this.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
					c = this.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
					b = this.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
					a = this.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
					d = this.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
					c = this.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
					b = this.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
					a = this.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
					d = this.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
					c = this.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
					b = this.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
			
					a = this.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
					d = this.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
					c = this.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
					b = this.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
					a = this.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
					d = this.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
					c = this.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
					b = this.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
					a = this.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
					d = this.md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
					c = this.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
					b = this.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
					a = this.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
					d = this.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
					c = this.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
					b = this.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
			
					a = this.md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
					d = this.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
					c = this.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
					b = this.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
					a = this.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
					d = this.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
					c = this.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
					b = this.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
					a = this.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
					d = this.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
					c = this.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
					b = this.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
					a = this.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
					d = this.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
					c = this.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
					b = this.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
			
					a = this.safe_add(a, olda);
					b = this.safe_add(b, oldb);
					c = this.safe_add(c, oldc);
					d = this.safe_add(d, oldd);
				}
				return Array(a, b, c, d);
			},
			
			md5_cmn: function(q, a, b, x, s, t) {
				return this.safe_add(this.bit_rol(this.safe_add(this.safe_add(a, q), this.safe_add(x, t)), s), b);
			},
			md5_ff: function(a, b, c, d, x, s, t) {
				return this.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
			},
			md5_gg: function(a, b, c, d, x, s, t) {
				return this.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
			},
			md5_hh: function(a, b, c, d, x, s, t) {
				return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
			},
			md5_ii: function(a, b, c, d, x, s, t) {
				return this.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
			},
			
			safe_add: function(x, y) {
				var lsw = (x & 0xFFFF) + (y & 0xFFFF);
				var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
				return (msw << 16) | (lsw & 0xFFFF);
			},
			
			bit_rol: function(num, cnt) {
				return (num << cnt) | (num >>> (32 - cnt));
			},
			
			
			rstr2hex: function(input) {
				var hexcase = 0;
				try {
					hexcase
				} catch (e) {
					hexcase = 0;
				}
				var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
				var output = "";
				var x;
				for (var i = 0; i < input.length; i++) {
					x = input.charCodeAt(i);
					output += hex_tab.charAt((x >>> 4) & 0x0F) +
						hex_tab.charAt(x & 0x0F);
				}
				return output;
			},
			
			rstr_hmac_md5: function(key, data) {
				var bkey = rstr2binl(key);
				if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);
			
				var ipad = Array(16),
					opad = Array(16);
				for (var i = 0; i < 16; i++) {
					ipad[i] = bkey[i] ^ 0x36363636;
					opad[i] = bkey[i] ^ 0x5C5C5C5C;
				}
			
				var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
				return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
			},
			///签名相关
			
			
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

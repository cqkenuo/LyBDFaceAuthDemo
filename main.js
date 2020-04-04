import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()

const that = Vue.prototype;

const domainName = 'https://api.xunmafu.com/api/face/'; 

//get请求	url		路径
//			params	json 如果不传默认空对象
//			isLoading	如果需要加载中动画就传true，否则默认false
Vue.prototype.get = function(url, params = {}, isLoading = false) {
	return requestPromise(url, 'GET', params, isLoading)
};

//post请求	url		路径
Vue.prototype.post = function(url, params = {}, isLoading = false) {
	return requestPromise(url, 'POST', params, isLoading)
};

const requestPromise = function(url, method, params, isLoading) {
	//isLoading	如果需要加载中动画就传true，否则默认false
	if (isLoading) {
		that.loading("加载中")
	}
	//创建promise函数	并return给requestPromise函数
	//resolve,结果回调函数
	return new Promise(function(resolve, reject) {
		uni.request({
			url: domainName + url,
			method: method,
			data: params,
			dataType: 'json',
			timeout: 30 * 1000,
			header: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			success: (res) => {
				uni.hideLoading();

				resolve(res);


				// if (code === '1001') {
				// 	//回调成功
				// 	uni.hideLoading();
				// 	resolve(data);
				// }
			},
			fail: (err) => {
				console.log('lygg.err=' + err)
				uni.hideLoading();
			}
		})
	})
}

//加载中
Vue.prototype.loading = (msg) => {
	uni.showLoading({
		title: msg
	});
}

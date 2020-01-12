Vue.component('navbar', {
	data() {
		return{

		}
	},
	computed: {
		isLoggedIn(){ return this.$store.state.isLoggedIn; },
	},
	created(){
		socket = io();
	},
	methods: {
		async handleLogout(){
			await this.$store.dispatch('logout')
			if(this.$store.getters.isLoggedIn === false){
				this.$router.push('/');
			}
		}
	},
	template: `
		<nav class="navbar navbar-dark navbar-expand-sm bg-primary mb-4">
			<a class="navbar-brand" href="/">G'Chat</a>
			<ul class="nav navbar-nav">
				<!-- <li class="nav-item active">
					<router-link class="nav-link" to="/">Login</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/signup">Signup</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/chats">Chats</router-link>
				</li> -->
				<li class="nav-item">
					<a @click="handleLogout" class="nav-link">Logout</a>
				</li>
			</ul>
		</nav>
	`
})
const ChatBox = Vue.component('chatbox', {
	data() {
		return{
			message: '',
			sender: '',
			messages: [],
			feedback: '',
			chatFeedback: ''
		}
	},
	computed: {
		username(){ return this.$store.state.username; },
		phoneNumber(){ return this.$store.state.phoneNumber; }
	},
	created(){
		socket = io();
	},
	mounted(){
		socket.on('connect', (data) => {
			console.log("You joined the chat");
		})
		socket.on('message', (data) => {
			this.messages.push(data);
			app.$nextTick( () => {
				var messageBox = document.getElementById('output');
				messageBox.scrollTop = messageBox.scrollHeight;
			})
		})
		socket.on('userLeft', (data) => {
			console.log(data);
			this.chatFeedback = data;
		})
	},
	methods: {
		sendMessage(){
			if(this.message != ''){
				let data = { message: this.message, username: this.$store.getters.username }
				this.feedback = '';
				socket.emit('message', data);
			} else {
				this.feedback = 'please enter a message';
			}
			this.message = '';
		},
		// disconnect(){
		// 	let response = 'someone left the chat';
		// 	socket.emit('userleft', response);
		// }
		// isTyping(){
		// 	this.chatFeedback = 'someone is typing...';
		// 	socket.emit('typing', this.chatFeedback)
		// }

	},
	template: `
		<div class="card shadow">
			<div class="card-header">
				<h5>Group Chat</h5>
				<div>{{ username }}</div>
			</div>
			<div class="card-body" id="output" style="height: 350px; overflow-y: scroll;">
				<small class="text-success">{{ chatFeedback }}</small>
				<div v-for="message in messages">
					<chatlist :message="message" key="message.index" />
				</div>
				<div id="feedback" class="text-center"></div>
			</div>
			<div class="card-footer">
				<form @submit.prevent="sendMessage" action="">
					<!-- <input type="text"  class="form-control form-control-sm mb-1" id="handle" placeholder="Handle"> -->
					<input type="text" v-model:value="message" class="form-control form-control-sm mb-1" autocomplete="off" placeholder="Enter your message...">
					<small class="text-danger"><i>{{ feedback }}</i></small>
					<button id="send" type="submit" class="btn btn-sm btn-block btn-primary">Send</button>
				</form>
			</div>
		</div>
	`
})
Vue.component('chatlist', {
	props: ['message'],
	data() {
		return {

		}
	},
	computed: {
		username(){ this.$store.getters.username }
	},
	methods: {
		isMyUsername(username){
	      if (username == this.$store.getters.username) {
	        return true
	      } else {
	        return false
	      }
		}
	},
	template: `<div>
					<div
						style="border-radius: 12px; clear: both; max-width: 80%;"
						v-if="isMyUsername(message.username)" class="bg-primary text-white float-right mb-1 p-1"
					>
						<div>{{ message.message }}</div>
					</div>
					<div
						v-else style="border-radius: 12px; clear:both; background-color: #d4d4d4; max-width: 80%;"
						class="shadow float-left mb-1 p-1">
						<div class="text-left"><small><i>{{ message.username }}</i></small></div>
						<div>{{ message.message }}</div>
					</div>
					<div class="clearfix"></div>
				</div>`
})
const Login = Vue.component('login', {
	data(){
		return {
			username: '',
			password: '',
			feedback: ''
		}
	},
	computed: {
	},
	methods: {
		async handleSubmit(){
			let data = { user_name: this.username, password: this.password };
			await this.$store.dispatch('login', data);
			if(this.$store.getters.isLoggedIn === true){
				this.$router.push('/chats');
			}
      },
	},
	template: `<div>
					<div class="card">
						<div class="card-header bg-primary py-2">
							<h4 class="text-white">Login</h4>
						</div>
						<div class="card-body">
							<div class="text-danger">{{ feedback }}</div>
							<form @submit.prevent="handleSubmit">
								<div class="form-group">
									<label>Username</label>
									<input type="text" class="form-control" v-model="username" required />
								</div>
								<div class="form-group">
									<label>Password</label>
									<input type="password" class="form-control" v-model="password" required />
								</div>
								<div class="text-right">
									<button @click="handleSubmit" class="btn btn-primary">Login</button>
								</div>
								<div class="small">Not a member? signup <router-link to="/signup">here</router-link></div>
							</form>
						</div>
					</div>
				</div>`
})
const Signup = Vue.component('signup', {
	data(){
		return {
			username: '',
	      	email: '',
	      	phone_number: '',
	      	password: '',
			feedback: ''
		}
	},
	computed: {
		isSignedUp(){ return this.$store.getters.isSignedUp },
		isError(){
			console.log(this.$store.getters.error)
			return this.$store.getters.error
		}
	},
	methods: {
      async handleSubmit(){
			let data = { user_name: this.username, email: this.email, phone_number: this.phone_number, password: this.password };
			await this.$store.dispatch('signup', data);
			console.log(this.$store.getters.isSignedUp);
			if(this.$store.getters.isSignedUp === true){
				// this.$router.push('/login');
			} else {
				this.feedback = this.$store.getters.error;
			}
      }
	},
	template: `<div>
					<div class="card">
						<div class="card-header bg-primary py-2">
							<h4 class="text-white">Signup</h4>
						</div>
						<div class="card-body">
							<form @submit.prevent="handleSubmit">
								<div class="form-group">
									<label>Username</label>
									<input type="text" class="form-control" v-model="username" required />
								</div>
								<div class="form-group">
									<label>Email</label>
									<input type="email" class="form-control" v-model="email" required />
								</div>
								<div class="form-group">
									<label>Phone Number</label>
									<input type="number" class="form-control" v-model="phone_number" required />
								</div>
								<div class="form-group">
									<label>Password</label>
									<input type="password" class="form-control" v-model="password" required />
								</div>
								<div class="alert alert-success" v-if="isSignedUp === true">
									<small>
										Successfull! click <router-link to="/">here</router-link> to proceed to login
									</small>
									<div class="small text-danger text-center">{{ feedback }}</div>
								</div>
								<div class="text-right">
									<button @click="handleSubmit" class="btn btn-primary">Submit</button>
								</div>
							</form>
						</div>
					</div>
				</div>`
})

const store = new Vuex.Store({
	state : {
		chats : null,
		messages: null,
		username : "",
		phoneNumber: "",
		isLoggedIn: false,
		isSignedUp: null,
		isConnected: false,
		authKey: "",
		error: ""
	},
	getters: {
		isLoggedIn: state => { return state.isLoggedIn },
		isSignedUp: state => { return state.isSignedUp },
		username: state => { return state.username },
		phoneNumber: state => { return state.phoneNumber },
		error: state => { return state.error }
	},
	mutations: {
		LOGIN: (state, payload) => {
			if(payload.message === true){
				// get user data and set loggedIn as true
				let { user_name, phone_number } = payload.data;
				state.username = user_name;
				state.phoneNumber = phone_number;
				state.isLoggedIn = true;
			} else {state.error = payload;}
		},
		SIGNUP: (state, payload) => {
			if(payload.message === true){
			  state.isSignedUp = true;
			  console.log(state.isSignedUp);
			} else {
				state.error = payload;
				console.log(state.error);
			}
		},
		FETCH_CHATS : (state, payload) => {
			state.chats = payload;
			console.log(state.chats)
		},
		ADD_CHAT : (state,payload) => {
			state.chats.push(payload);
			console.log(state.chats)
		},
		LOGOUT: (state) => {
			if(state.isLoggedIn === true){
				state.isLoggedIn = false;
			}
		}
	},
	actions: {
		login: async ({commit}, payload) => {
			try {
			  const { data } = await axios.post('/user/login', payload);
			  commit('LOGIN', data);
			} catch(err) {
			  console.log(err);
			}
		},
		signup: async ({commit}, payload) => {
			console.log(payload)
			try {
			  const { data } = await axios.post('/user/signup', payload);
			  console.log(data)
			  commit('SIGNUP', data);
			} catch(err) {
			  console.log(err);
			}
		},
		fetchChats : async ({commit}) => {
			let { data } = await axios.get('http://localhost:9000/chat');
			commit("FETCH_CHATS", data);
		},
		addChat : ({commit}, payload) => {
			commit("ADD_CHAT", payload);
		},
		logout: ({commit}) => {
			commit("LOGOUT");
		}
	}
})

const routes = [
	{ path: '/', name: 'login', component: Login },
	{ path: '/signup', name: 'signup', component: Signup },
	{
		path: '/chats',
		name: 'chats',
		component: ChatBox,
		async beforeEnter(to, from, next){
			try {
				console.log(store.getters.isLoggedIn);
				if(store.getters.isLoggedIn === true){
					next()
				} else {
					next({
						name: 'login'
					})
				}
			} catch(err) {
				console.log(err)
			}
		}
	}
];
const router = new VueRouter({
	routes: routes,
	mode: 'history'
});

var socket = null;
const app = new Vue({
	el: '#app',
	store: store,
	router
})
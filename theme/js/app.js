axios.defaults.xsrfHeaderName = 'DATA-XSRF-TOKEN'
axios.defaults.xsrfCookieName = 'DATA-XSRF-TOKEN'

var router = new VueRouter({
  routes: [
        { path: '/', component: Vue.component('screen-topics')},
        { path: '/table', component: Vue.component('screen-data')},
        { path: '/table/:oid', component: Vue.component('screen-data')}
    ]
})

var app = new Vue({
  el: '#app',
  vuetify: new Vuetify({
    icons: {
      iconfont: 'md',
    },
  }),
  router: router,
  store: store,
  data: {

  },
  beforeMount: function(){
    this.loadTables();
  },
  mounted(){
  },
  methods: {
    loadTables: function(){
      this.$store.dispatch('get_objects');
    }
  }
});


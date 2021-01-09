Vue.component('screen-topics', {
  template: '#screen-topics-template',

  data: () => ({
    cards: [
    ],
  }),

  beforeMount: function(){

  },
  computed: {
    items () {
      var self = this;
      return self.$store.state.objects.map(o => {
        return {
          text: self.$store.state.captions[o.object + '_name'],
          icon: self.$store.state.captions[o.object + '_icon'],
          table: o.oid
        }
      });
    },
  },
  methods: {
    loadTable: function (oid) {
      this.$router.push({ path: '/table/' + oid })
    },
  }
});

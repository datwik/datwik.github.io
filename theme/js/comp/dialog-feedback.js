Vue.component('dialog-feedback', {
    template: '#dialog-feedback-template',
    
      data: () => ({ 
        valid: true,
        dialog: false,        

        feedbackSnackbar: false,
        feedbackSnackbarTimeout: 2000,
        feedbackSnackbarColor:'primary',
        feedbackSentText: 'Thank you for your feedback!',

        feedbackEmail: '',
        feedbackEmailRules:[
          v => !v || validator.isEmail(v) || 'Invalid email'
        ],
        feedbackTheme: '',
        feedbackThemeRules:[
          true
        ],
        feedbackText: '',
        feedbackTextRules: [
            v => !!v || 'Please enter your feedback',
            v => v && v.length <= 1024 || 'Max 1024 letters',
        ],
      }),
      props:    [
        'id', 'type'
      ],
      beforeMount: function(){  
        
      },
      computed: {

      },
      watch: {
        dialog() {
          if(this.$refs.feedbackForm)
            this.$refs.feedbackForm.reset();
        }
      },
      methods: {
        showDialog: function(){
          this.dialog = true;
        },

        onCancel: function(){
          this.closeDialog()
        },       
 
        closeDialog: function(){
          var self = this;
          this.dialog = false;
          this.$nextTick(() => {
            if(self.$refs.toolbarButton)
              self.$refs.toolbarButton.$el.blur();
          });
        },    

        onSendFeedback: function(){
          if(!this.$refs.feedbackForm.validate())
          {
              return;
          }

          this.sendFeedback();
          this.closeDialog();
        },

        sendFeedback:function(){   
            var self = this;
            var headers = {};
            axios({
                url: self.$store.state.api + '/action/feedback',
                method: 'post',
                headers: headers,
                data: {
                  't': self.$store.state.tableId,
                  'r': self.$route.fullPath,
                  'f': {
                      'e': self.feedbackEmail,
                      'm': self.feedbackTheme,
                      't': self.feedbackText,
                  }
                },
                // withCredentials: true
            }).then(function(res) {
              self.feedbackSnackbarColor = 'primary'
              self.feedbackSentText = 'Thank you for your feedback!';
              self.feedbackSnackbar = true;                              
            }).catch(function(e) {
              console.log('Error: ' + e );
              self.feedbackSnackbarColor = 'red'
              self.feedbackSentText = 'Error sending feedback, please try again'
              self.feedbackSnackbar = true;              
            });
        }
      }
    });
    
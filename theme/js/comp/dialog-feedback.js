Vue.component('dialog-feedback', {
    template: '#dialog-feedback-template',
    
      data: () => ({ 
        valid: true,
        dialog: false,        
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

        onSendFeedback: function(){
          if(!this.$refs.feedbackForm.validate())
          {
              return;
          }

          this.sendFeedback();
          this.dialog = false;          
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
                // withCredentials: true  //  Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’
            }).then(function(res) {
                // console.log('Feedback sent');
            }).catch(function(e) {
                console.log('Error: ' + e );
            });

        }

      }
    });
    
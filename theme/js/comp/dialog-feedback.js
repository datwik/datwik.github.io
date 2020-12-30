Vue.component('dialog-feedback', {
    template: '#dialog-feedback-template',
    
      data: () => ({
        dialog: false,
        rules: [v => v.length <= 1024 || 'Max 1024 characters'],
        feedbackText: '',
        feedbackEmail: '',
        feedbackTheme: '',
      }),
    
      beforeMount: function(){  
      },
      computed: {
      },
      methods: {
      }
    });
    
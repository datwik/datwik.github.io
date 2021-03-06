Vue.component('screen-data', {
    template: '#screen-data-template',
  
    data: () => ({
        editFieldDialog: false,
        editFieldValue: '',
        editFieldRules:[
          v => !!v || 'Please enter the price',
          v => v && validator.isCurrency(v, {allow_negatives:false,digits_after_decimal:[1,2]}) || 'Invalid price'
        ],
        editFieldValid: true,
        editFieldLabel: '',
        editFieldRowName: '',
        editFieldName: '',
        editFieldOid: '',
        editFieldSnackbar: false,
        editFieldSnackbarTimeout: 2000,
        editFieldSnackbarColor:'primary',
        editFieldSentText: 'Thank you for your feedback!',


        headers: [],
        dataRows: [],
        editedIndex: -1,
        editedItem: {
        },
        defaultItem: {
        },
        page: 1,
        pageCount: 0,
        itemsPerPage: 5,        
        totalItemCount: 10,
        loading: false,
        options: {},
        search: null,
      }),
  
      beforeMount: function(){
        var self = this;
        this.headers = []
        this.dataRows = []
        this.page = 1
        
        this.$store.commit('change_table', {t: self.$route.params.oid})

        Promise.all([
          self.$store.dispatch('get_fields'), 
          // self.$store.dispatch('get_rows')
        ]).then(() => {
            // console.log(`sd fields: ${self.$store.state.fields['company']}`)
            // console.log(`sd rows: ${self.$store.state.rows}`)
            self.initialize();
        })          
        
      },

      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        },

        linkSlots: function () {
          var e = Array.from( this.$store.state.fields.values()).
                  filter(f => f.subtype == 1).
                  map(f => f.field.replace('_url', ''));
          return e;
        },

        editSlots: function () {
          var e = Array.from( this.$store.state.fields.values()).
                  filter(f => f.editable).
                  map(f => f.field);
          return e;
        },

        hasExpandedFields: function () {
          var expandedCount = Array.from( this.$store.state.fields.values()).
                  filter(f => f.expanded).
                  length;
          // console.log('Expanded: ' + expandedCount)
          return  expandedCount > 0;
        },

        expandedFields: function () {
          return Array.from( this.$store.state.fields.values()).
                  filter(f => f.expanded).
                  map(f => f.field);
        }
      },
  
      watch: {
        editFieldDialog() {
          if(this.$refs.editFieldForm)
            this.$refs.editFieldForm.reset();
        },
        
        options() {
            this.fetchRows();
        }

      },
  
      created () {
        // this.initialize()
      },
  
      methods: {
        initialize () {
          var self = this;

          var headerList = new Array();
          self.$store.state.fields.forEach((v, k) => {
            if(v.subtype > 0 || v.expanded)
              return;
            headerList.push({
              text: self.$store.state.captions[k],
              value: k
            });
          }); 
          headerList.push({ text: '', value: 'data-table-expand' });
          this.headers = headerList;
          // console.log(`sd headers: ${this.headers}`)


          this.updateRows();
        },

        tableTitle: function(){
          var ss = this.$store.state;
          var obj = ss.objects.filter(o => o.oid == ss.tableId)
          if(obj && obj[0])
            return ss.captions[obj[0].object + '_name']
        },

        tableFooterText: function(){
          var ss = this.$store.state;
          var obj = ss.objects.filter(o => o.oid == ss.tableId)
          if(obj && obj[0])
            return ss.captions[obj[0].object + '_footer']
        },

        updateRows: function(){
          var self = this;
          var rowList = new Array();
          self.$store.state.rows.forEach(v => {
            var row = {};
            row['id'] = v.id
            self.$store.state.fields.forEach((fv, fk) => {
              row[fk] = self.formatField(fv.type, v.data[fv.seqnum])
            });

            rowList.push(row);
          }); 

          this.dataRows = rowList;   
          this.updateTotalItemCount();
        },

        formatField: function(type, value){
          var self = this;
          if(type == 3){            
            return this.formatMoney(value);
          }
          else if(type == 4 && value && value.split){
            return value.split('|').map(s => self.capitalizeFirstLetter(s)).join(", ")
          }

          return value;
        },

        capitalizeFirstLetter: function(v) {
          return v.charAt(0).toUpperCase() + v.slice(1);
        },

        formatMoney : function(v){
          if(!v || v == '')
              v = '0.00'
          let value = !v ? '0.00' : v;
          value = v && v.toFixed ?  v.toFixed(2) : value;
          return parseFloat(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
        },

        updateTotalItemCount: function(){
          var pageExtra = this.dataRows.length < this.itemsPerPage ? 0 : 1;
          this.totalItemCount = this.itemsPerPage * (this.page + pageExtra);
        },

        fetchRowsSearch() {
          this.options.page = 1;
          this.fetchRows()
        },

        fetchRows: function() {
            var self = this;
            this.loading = true;
            this.$store.commit('update_rows_filter', {
                page: this.options.page, search: this.search, sortBy: this.options.sortBy, sortDesc: this.options.sortDesc
            });
            self.$store.dispatch('get_rows')
            .then(() => {
              this.updateRows();              
            })
            .finally(() => self.loading = false);
        },
  
        editItem (item) {
          this.editedIndex = this.dataRows.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialog = true
        },
  
        deleteItem (item) {
          this.editedIndex = this.dataRows.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        },
  
        deleteItemConfirm () {
          this.dataRows.splice(this.editedIndex, 1)
          this.closeDelete()
        },
  
        close () {
          this.dialog = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        closeDelete () {
          this.dialogDelete = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        save () {
          if (this.editedIndex > -1) {
            Object.assign(this.dataRows[this.editedIndex], this.editedItem)
          } else {
            this.dataRows.push(this.editedItem)
          }
          this.close()
        },

        is_url: function(item, slot){
          return item[slot + "_url"]
        },

        get_url: function(item, slot){
          var url = item[slot + "_url"]
          try {
            return url + (url && url.includes('?') ? '&' : '?') + 'ref=datwik.com'
          }catch(err) {
            return ''
          }
        },

        get_url_text: function(item, slot){
          return item[slot]
        },

        get_text: function(item, slot){
          return item[slot];
        },

        onShowEditFieldDialog: function(item, slot){
          var fields = Array.from(this.$store.state.fields.values());
          this.editFieldLabel = this.c(slot)
          this.editFieldRowName = item[fields[0].field] + ' - ' + item[fields[1].field]
          this.editFieldOid = item['id'];
          this.editFieldName = slot;
          this.editFieldDialog = true;        
        },

        onCancelEditField: function(){
          this.editFieldDialog = false;
        },

        onSubmitEditField: function(){
          if(!this.$refs.editFieldForm.validate())
          {
              return;
          }

          this.sendFieldValue();
          this.editFieldDialog = false;
        },


        sendFieldValue:function(){   
          var self = this;
          var headers = {};
          axios({
              url: self.$store.state.api + '/action/field_value',
              method: 'post',
              headers: headers,
              data: {
                't': self.$store.state.tableId,
                'o': self.editFieldOid,
                'f': self.editFieldName,
                'v': self.editFieldValue
              },
              withCredentials: true
          }).then(function(res) {
            self.editFieldSnackbarColor = 'primary'
            self.editFieldSentText = 'Thank you for reporting current price!';
            self.editFieldSnackbar = true;                              
          }).catch(function(e) {
            console.log('Error: ' + e );
            self.editFieldSnackbarColor = 'red'
            self.editFieldSentText = 'Error sending current price, please try again'
            self.editFieldSnackbar = true;              
          });
      },
    


        c: function(k){
          return this.$store.state.captions[k];
        }

      },

  });
  
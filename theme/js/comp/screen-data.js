Vue.component('screen-data', {
    template: '#screen-data-template',
  
    data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [],
        dataRows: [],
        editedIndex: -1,
        editedItem: {
          name: '',
          calories: 0,
          fat: 0,
          carbs: 0,
          protein: 0,
        },
        defaultItem: {
          name: '',
          calories: 0,
          fat: 0,
          carbs: 0,
          protein: 0,
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
            console.log(`sd fields: ${self.$store.state.fields['company']}`)
            // console.log(`sd rows: ${self.$store.state.rows}`)
            self.initialize();
        })          
        
      },

      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        },

        linkSlots: function () {
          return Array.from( this.$store.state.fields.values()).
                  filter(f => f.subtype == 1).
                  map(f => f.field.replace('_url', ''));
        },

        expandedFields: function () {
          return Array.from( this.$store.state.fields.values()).
                  filter(f => f.expanded).
                  map(f => f.field);
        }
      },
  
      watch: {
        dialog (val) {
          val || this.close()
        },
        dialogDelete (val) {
          val || this.closeDelete()
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
          console.log(`sd headers: ${this.headers}`)


          this.updateRows();
        },

        updateRows: function(){
          var self = this;
          var rowList = new Array();
          self.$store.state.rows.forEach(v => {
            var row = {};
            row['id'] = v.id
            self.$store.state.fields.forEach((fv, fk) => {
              row[fk] = v.data[fv.seqnum]
            });

            rowList.push(row);
          }); 

          this.dataRows = rowList;   
          this.updateTotalItemCount();
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
        }
        ,

        c: function(k){
          return this.$store.state.captions[k];
        }
      },

  });
  
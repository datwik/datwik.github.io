var store_util = {
    convertToMap: function(value){
        vmap = new Map();
        for (const key in value) {
            vmap[key] = value[key];                
        }
        return vmap;
    },

    _row_filter_to_url_args: function(filter){
        var args = [];

        if('page' in filter){
            args.push(`page=${filter.page}`)
        }
        if('search' in filter && filter.search)
        {
            args.push(`search=${filter.search}`)
        }
        if('sortBy' in filter && filter.sortBy && filter.sortBy.length && filter.sortBy[0])
        {
            args.push(`sortBy=${filter.sortBy[0]}`)
        }
        if('sortDesc' in filter && filter.sortDesc && filter.sortDesc.length && filter.sortDesc[0])
        {
            args.push(`sortDesc=${filter.sortDesc[0]}`)
        }

        if(args.length)
            return '&' + args.join('&');
        
        return '';
    },    
}



var store = new Vuex.Store({
    state: {
        api: api.url,
        
        captions: window.dw_captions['en'],

        objects: [],
        fields: [],
        rows: [],
        rows_filter: {},
        
        tableId: 2,
        
        table_fields: [],
        detail_fields: [],

        rows_total_count: [],
        reviews: [],
        changes: [],

        activity: [],

        ca_provinces: window.dw_ca_provinces['en']
    },
    getters: {
        msg: (state) => (id) => {
            if(id.startsWith('[')){
                var args = JSON.parse(id.replace(/'/g, "\""));
                var cid = args.shift();
                var caption = state.captions[cid];
                if(!caption)
                    return "[" + id + "]";

                args.forEach((a) => {
                    caption = caption.replace('{}', a);
                });
                return caption;
            }
            var caption = state.captions[id];
            if(!caption)
                return "[" + id + "]";

            return caption;
        },
        ca_province: (state) => (abbr) => {
            var caption = state.ca_provinces[abbr];
            if(!caption)
                return "[" + abbr + "]";

            return caption;
        },
        has_detail_fields: (state) => () => {
            return state.detail_fields.length > 0;
        }

    },
    mutations: {
        update_objects (state, payload) {
            state.objects = payload;
            console.log(`objects: ${JSON.stringify(state.objects)}`);
        },

        change_table (state, payload) {
            state.tableId = payload.t;
        },

        update_fields (state, payload) {
            var valueMap = new Map();
            payload.forEach(v => { 
                valueMap.set(v.field, v);
            });
            state.fields = valueMap;
            console.log(`fields: ${JSON.stringify([...valueMap])}`);
        },

        update_rows (state, payload) {
            state.rows = payload;
            console.log(`rows: ${JSON.stringify(state.rows)}`);
        },

        update_rows_filter(state, payload) {
            state.rows_filter = payload;
            state.rows_filter.search = payload.search;
        }
    },
    actions: {

        async get_objects (context) {
            var value = await context.dispatch('fetch', {'part': '/data/objects'})
            context.commit('update_objects', value)
        },

        async get_fields (context) {
            var value = await context.dispatch('fetch', {'part': '/data/fields', 'args': `?t=${context.state.tableId}`})
            context.commit('update_fields', value)
        },

        async get_rows (context) {
            var value = await context.dispatch('fetch', {'part': '/data/rows', 'args': `?t=${context.state.tableId}${store_util._row_filter_to_url_args(context.state.rows_filter)}`})
            context.commit('update_rows', value)
        },

        async fetch (context, payload){
            return await axios({
                url: context.state.api + payload.part + (payload.args ? payload.args : ''),
                method: 'get',
                headers: {},
            }).then(function(res) {
                return res.data;
            }).then(function(json) {
                return json;
            }).catch(function(e) {
              console.log('Error: ' + e );
              throw new Error(e);
            });
        },
    },
})
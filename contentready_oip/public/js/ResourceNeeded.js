new Vue({
    name: 'ResouceNeeded',
    delimiters: ['[[', ']]'],
    el: '.form-group[data-fieldname="resources_needed"]',
    data(){
        return{
            helpText: '',
            resourceOptions: []
        }
    },
    mounted(){
        this.arrangeHelpText();
        this.getResourceNeeded();
    },
    methods:{
        arrangeHelpText(){
            const resourceHelpTxt = $('[data-fieldtype="Table"][data-fieldname="resources_needed"] p.text-muted');
            this.helpText = resourceHelpTxt.text();
            resourceHelpTxt.detach();
        }, 

        getResourceNeeded(){
            const newThis = this;
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype:"Resource",
                    fieldname:["name","title"]
                },
                callback: function (r) {
                    const { message } = r;
                    newThis.resourceOptions = message.map(v => v.name).sort();
                }
            })
        },

        handleClick(item){
            const { resources_needed = [] } = frappe.web_form.doc;
            const index = resources_needed.findIndex(r => r.resource === item);
            if (index > -1) {
                resources_needed.splice(index,1);
            }else{
                resources_needed.push({resource: item});
            }

            frappe.web_form.doc.resources_needed = resources_needed;
            this.$forceUpdate();
        },

        toggleClass(item){
            const { resources_needed = [] } = frappe.web_form.doc;
            const isPresent = resources_needed.find(r => r.resource === item);
            return !!isPresent;
        },
    },
    template: `
    <div>
        <div class="clearfix">
        <label class="control-label label-styles" style="padding-right: 0px;">Resources Needed</label>
        <p>[[ helpText ]]</p>
        </div>

        <div class="row">
          <div class="col d-flex flex-wrap">
            <button 
              v-for="option in resourceOptions"
              class="btn btn-lg mb-3 mr-3 btnHover" 
              :title="option"
              :class="{
                'btn-primary': toggleClass(option),
                'btn-outline-primary' :!toggleClass(option),
                'text-white': toggleClass(option),
              }"
              v-on:click="handleClick(option)"
            >
            [[ option ]]
            </button>
          </div>
        </div>
    </div>
    `
})
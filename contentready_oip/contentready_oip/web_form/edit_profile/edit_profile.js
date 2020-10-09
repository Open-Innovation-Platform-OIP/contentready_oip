frappe.provide('Vue');

frappe.ready(async function () {
  // Start helpers
  // Simple sleep(ms) function from https://stackoverflow.com/a/48882182
  const sleep = (m) => new Promise((r) => setTimeout(r, m));

  let orgs = {};

  // Fix layout - without this, the entire form occupies col-2 due to custom CSS.
  moveDivs = () => {
    $('.section-body > div').each(function () {
      $(this).parent().before(this);
    });
  };

  const fixOuterDivForMobile = () => {
    $('.col-9').removeClass('col-9').addClass('col-sm-12 col-md-10');
  };

  arrangeDivs = function () {
    // $('.page_content').wrap('<div class="row justify-content-center"><div class="col-10"></div></div>');
    $('.form-layout').addClass('bg-transparent px-0');
  };

  createOrgOptions = () => {
    $('*[data-fieldname="org_title"]').attr('list', 'orgs');
    $('*[data-fieldname="org_title"]').after('<datalist id="orgs"></datalist>');
    frappe.call({
      method: 'contentready_oip.api.get_orgs_list',
      args: {},
      callback: function (r) {
        r.message.map((op) => {
          $('#orgs').append(
            $('<option>', {
              value: op.label,
            })
          );
          orgs[op.label] = op.value;
        });
      },
    });
  };

  const getAvailableSectors = function () {
    frappe.call({
      method: 'contentready_oip.api.get_sector_list',
      args: {},
      callback: function (r) {
        let user_sectors;
        if (frappe.web_form.doc.sectors) {
          user_sectors = frappe.web_form.doc.sectors.map((s) => s.sector);
        }

        sectorsVueComp.user_sectors = user_sectors || [];
        sectorsVueComp.avail_sectors = r.message;
      },
    });
  };

  const getAvailablePersonas = function () {
    frappe.call({
      method: 'contentready_oip.api.get_persona_list',
      args: {},
      callback: function (r) {
        let user_personas;
        if (frappe.web_form.doc.personas) {
          user_personas = frappe.web_form.doc.personas.map((p) => p.persona);
        }

        personaVueComp.user_personas = user_personas;
        personaVueComp.avail_personas = r.message;
      },
    });
  };

  // addSectorToDoc = event => {
  //   if (!frappe.web_form.doc.sectors) {
  //     frappe.web_form.doc.sectors = [];
  //   }
  //   frappe.web_form.doc.sectors.push({ sector: event.target.value });
  // };

  addFileToDoc = (file) => {
    if (file.xhr) {
      const response = JSON.parse(file.xhr.response);
      frappe.web_form.doc.photo = response.message.file_url;
    }
  };

  removeFileFromDoc = (file) => {
    // console.log('removed', file);
    frappe.web_form.doc.photo = '';
  };

  addDropzone = () => {
    // disable autoDiscover as we are manually binding the dropzone to a form element
    Dropzone.autoDiscover = false;
    const el = `<form class="dropzone dz-clickable d-flex align-items-center justify-content-center flex-wrap mb-4" style="font-size:var(--f14);" id='dropzone'><div class="dz-default dz-message"><button class="dz-button" type="button">Drop files here to upload</button></div></form>`;
    $('*[data-fieldname="photo"]').after(el);
    $('#dropzone').dropzone({
      url: '/api/method/upload_file',
      autoDiscover: false,
      maxFiles: 1,
      addRemoveLinks: true,
      acceptedFiles: 'image/*',
      headers: {
        Accept: 'application/json',
        'X-Frappe-CSRF-Token': frappe.csrf_token,
      },
      init: function () {
        // use this event to add to child table
        this.on('complete', addFileToDoc);
        // use this event to remove from child table
        this.on('removedfile', removeFileFromDoc);
        if (frappe.web_form.doc.photo) {
          const file_url = frappe.web_form.doc.photo;
          let mockFile = { name: file_url, size: null };
          this.displayExistingFile(mockFile, file_url);
        }
      },
    });
  };

  addActionButtons = () => {
    const publishBtn = `<button class="btn btn-sm btn-primary ml-2" onclick="publishProfile()">Update</button>`;
    $('.page-header-actions-block').append(publishBtn);
  };

  initAutocomplete = () => {
    // TODO: Use domain settings to retrieve country list
    $('*[data-fieldname="city"]:text')
      .attr('id', 'autocomplete')
      .attr('placeholder', 'Search here');
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      { types: ['(cities)'], componentRestrictions: { country: 'in' } }
      // { types: ['(cities)'] }
    );
    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    // See https://developers.google.com/maps/documentation/javascript/places-autocomplete#add_autocomplete
    autocomplete.setFields(['address_component', 'geometry']);
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
  };

  fillInAddress = () => {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    const addressMapping = {
      locality: {
        long_name: 'city',
      },
      administrative_area_level_1: {
        short_name: 'state_code',
        long_name: 'state',
      },
      country: {
        short_name: 'country_code',
        long_name: 'country',
      },
    };

    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    for (let i = 0; i < place.address_components.length; i++) {
      const address_type = place.address_components[i].types[0];
      if (addressMapping[address_type]) {
        if (addressMapping[address_type]['short_name']) {
          frappe.web_form.set_value(
            addressMapping[address_type]['short_name'],
            place.address_components[i]['short_name']
          );
        }
        if (addressMapping[address_type]['long_name']) {
          frappe.web_form.set_value(
            addressMapping[address_type]['long_name'],
            place.address_components[i]['long_name']
          );
        }
      }
    }
    frappe.web_form.set_value('latitude', place.geometry.location.lat());
    frappe.web_form.set_value('longitude', place.geometry.location.lng());
  };

  publishProfile = () => {
    frappe.call({
      method: 'contentready_oip.api.add_primary_content',
      args: {
        doctype: 'User Profile',
        doc: frappe.web_form.doc,
      },
      callback: function (r) {
        // console.log(r.message);
        if (r.message && r.message.route) {
          window.location.href = r.message.route;
        } else {
          window.location.href = '/dashboard';
        }
      },
    });
  };

  const controlLabels = () => {
    $('.control-label').addClass('label-styles');
    $('span.label-area.small').removeClass('small');
  };

  const styleFormHeadings = () => {
    $('h6').not(':first').prepend('<hr />');
    $('.form-section-heading').addClass('edit-profile-subheadings');
  };

  const pageHeadingSection = () => {
    $('button:contains("Update") , button:contains("Save")')
      .removeClass('btn-primary btn-sm')
      .addClass('btn-outline-primary outline-primary-btn');

    $('.page-header-actions-block').addClass('d-flex align-items-center');
    // $('.page-header').parent().wrap('<div class="row justify-content-center"><div class="col-10"></div></div>');

    $('.page-header h2').css({ 'margin-bottom': '0px' });
    $('#introduction').addClass('d-none');
  };

  const styleFields = () => {
    $('.input-with-feedback').addClass('field-styles');
  };

  const addSection = function () {
    // For Sectors
    $('*[data-fieldname="sectors"]').before(
      '<label class="control-label" style="padding-right: 0px;">Sectors</label><br/><div id="sectorsComp"></div>'
    );

    // For Personas
    $('*[data-fieldname="personas"]').before(
      '<label class="form-group control-label">Personas</label><br/><div id="personasComp"></div>'
    );
  };

  // End Helpers
  // Delay until page is fully rendered
  while (!frappe.web_form.fields) {
    await sleep(1000);
  }

  // Start UI Fixes
  // We hide the default form buttons (using css) and add our own
  $('*[data-doctype="Web Form"]').wrap(
    `<div class="container pt-5"><div class="row justify-content-center"><div class="col-9"></div></div></div>`
  );

  $('div[role="form"]').ready(function () {
    addActionButtons();
    moveDivs();
    arrangeDivs();
    createOrgOptions();
    fixOuterDivForMobile();
    // createPersonaOptions();
    // createSectorOptions();
    addSection();
    controlLabels();
    styleFormHeadings();
    styleFields();
    pageHeadingSection();
  });

  const sectorsVueComp = new Vue({
    name: 'Sectors',
    el: '#sectorsComp',
    data() {
      return {
        avail_sectors: [],
        user_sectors: [],
      };
    },
    created() {
      getAvailableSectors();
    },
    methods: {
      toggleClass(sector) {
        let is_present = this.user_sectors.find((s) => sector === s);
        if (is_present) {
          return true;
        }
        return false;
      },
      updateSectorToDoc(sectorClicked) {
        if (!frappe.web_form.doc.sectors) {
          frappe.web_form.doc.sectors = [];
        }

        const updatedSectors = [...frappe.web_form.doc.sectors];

        let index = updatedSectors.findIndex((s) => s.sector === sectorClicked);

        if (index > -1) {
          updatedSectors.splice(index, 1);
        } else {
          updatedSectors.push({ sector: sectorClicked });
        }

        frappe.web_form.doc.sectors = updatedSectors;
        getAvailableSectors();
      },
    },
    template: `
    {% raw %}
    <div class="row">
      <div class="col d-flex flex-wrap">
          <button 
            v-for="sector in avail_sectors" 
            class="btn btn-lg mb-3 mr-3" 
            :class="{
              'btn-primary': toggleClass(sector['value']),
              'text-white': toggleClass(sector['value']),
              'btn-outline-primary' :!toggleClass(sector['value']) 
            }"

            v-on:click="updateSectorToDoc(sector['value'])"
            >
            {{sector['label']}}
          </button>
      </div>
    </div>
    {% endraw %}
    `,
  });

  const personaVueComp = new Vue({
    name: 'Personas',
    el: '#personasComp',
    data() {
      return {
        avail_personas: [],
        user_personas: [],
      };
    },
    created() {
      getAvailablePersonas();
    },
    methods: {
      toggleClass(persona) {
        let is_present = this.user_personas.find((p) => persona === p);
        if (is_present) {
          return true;
        }
        return false;
      },
      updatePersonaToDoc(personaClicked) {
        if (!frappe.web_form.doc.personas) {
          frappe.web_form.doc.personas = [];
        }
        const updatedPersonas = [...frappe.web_form.doc.personas];

        let index = updatedPersonas.findIndex(
          (s) => s.persona === personaClicked
        );

        if (index > -1) {
          updatedPersonas.splice(index, 1);
        } else {
          updatedPersonas.push({ persona: personaClicked });
        }

        frappe.web_form.doc.personas = updatedPersonas;
        getAvailablePersonas();
      },
    },
    template: `
    {% raw %}
    <div class="row">
      <div class="col d-flex flex-wrap">
          <button 
            v-for="persona in avail_personas" 
            class="btn btn-lg mb-3 mr-3" 
            :title="persona['label']"
            :class="{
              'btn-primary': toggleClass(persona['value']),
              'text-white': toggleClass(persona['value']),
              'btn-outline-primary' :!toggleClass(persona['value']) 
            }"
            v-on:click="updatePersonaToDoc(persona['value'])"
            >
            {{persona['label']}}
          </button>
      </div>
    </div>
    {% endraw %}
    `,
  });

  // Start Google Maps Autocomplete
  const gScriptUrl =
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyAxSPvgric8Zn54pYneG9NondiINqdvb-w&libraries=places';
  $.getScript(gScriptUrl, initAutocomplete);
  // End Google Maps Autocomplete

  // Start dropzone.js integration
  const dScriptUrl = 'assets/contentready_oip/js/dropzone.js';
  $.getScript(dScriptUrl, addDropzone);
  // End dropzone.js integration

  // set email field
  frappe.web_form.set_df_property('user', 'read_only', 1);
  frappe.web_form.set_value('user', frappe.session.user);
  // frappe.web_form.doc.user = frappe.session.user;
});


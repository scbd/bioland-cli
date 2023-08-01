import consola from 'consola';
import { execSync } from 'child_process';
import request from 'superagent';

const configMap = {};

export default async (branch, commandArgs, { Util }) => {
  const allSites = clone(Util.config.siteCodes);
  const done = ['rjh', 'seed'];
  const sites = allSites.filter((x) => !done.includes(x));
  const completed = [];
  let remaining = sites.length;

  for (const countryCode of sites) {
    await createVocab(countryCode, Util);
    await createFieldTables(countryCode, Util);
    await Util.releaseConnection(countryCode);

    execSync(`ddev drush @${countryCode} entity:save taxonomy_vocabulary`);
    execSync(`ddev drush @${countryCode} cr`);

    await createTargets(countryCode, Util);
    remaining--;

    consola.success(`Site: ${countryCode} - remaining: ${remaining}`);
    completed.push(countryCode);

    consola.warn('completed: ', completed);
  }
};

async function createTargets (countryCode, Util) {
  const exists = await targetsExist(countryCode, Util);

  if (exists) return;

  const targets = await getTargets();

  await Util.login(countryCode);
  for (const target of targets) {
    try {
      await Util.jsonApiPost(countryCode, { path: 'taxonomy_term/gbf_targets', data: formatTarget(target) });
    } catch (e) {
      consola.error(e?.response?.body?.errors);
      consola.error(e);
      return;
    }
  }
}

async function getTargets () {
  return (await request.get('https://api.cbd.int/api/v2013/thesaurus/domains/GBF-TARGETS/terms')
    .set('accept', 'json')).body;
}

async function targetsExist (countryCode, Util) {
  try {
    const res = await Util.jsonApiGet(countryCode, { path: 'taxonomy_term/gbf_targets' });

    return res?.body?.data?.length === 23;
  } catch (e) {
    return false;
  }
}

function clone (anObj) {
  return JSON.parse(JSON.stringify(anObj));
}

async function createFieldTables (countryCode, Util) {
  const exists = await Util.getConfigObject(countryCode, 'taxonomy.vocabulary.gbf_targets');

  if (exists) return;

  await Util.dbCreateTaxonomyFieldTable(countryCode, 'shorttitle');
  await Util.dbCreateTaxonomyFieldTable(countryCode, 'longdescription');
  await Util.dbCreateTaxonomyFieldTable(countryCode, 'identifier');
  await Util.dbCreateTaxonomyFieldTable(countryCode, 'scbdtermid');
  await Util.releaseConnection(countryCode);
  await addToVocabFieldMap(countryCode, Util);
}

async function addToVocabFieldMap (countryCode, Util) {
  const obj = await Util.getKeyValue(countryCode, 'entity.definitions.bundle_field_map', 'taxonomy_term');

  await Util.setKeyValue(countryCode, 'entity.definitions.bundle_field_map', 'taxonomy_term', updateFieldMapObject(obj));
}

async function createVocab (countryCode, Util) {
  const exists = await Util.getConfigObject(countryCode, 'taxonomy.vocabulary.gbf_targets');

  if (exists) return;

  for (const key in configMap) {
    await Util.createConfigObject(countryCode, key, configMap[key]);
  }
}

configMap['taxonomy.vocabulary.gbf_targets'] = {
  uuid: 'd0723b81-5721-4134-be5c-1497f24fc540',
  langcode: 'en',
  status: true,
  dependencies: [],
  name: 'GBF Targets',
  vid: 'gbf_targets',
  description: '',
  weight: 0
};

configMap['language.content_settings.taxonomy_term.gbf_targets'] = {
  uuid: '0be5b931-3980-4dae-a9a8-96dc0a03e880',
  langcode: 'en',
  status: true,
  dependencies: { config: ['taxonomy.vocabulary.gbf_targets'] },
  id: 'taxonomy_term.gbf_targets',
  target_entity_type_id: 'taxonomy_term',
  target_bundle: 'gbf_targets',
  default_langcode: 'site_default',
  language_alterable: false
};
configMap['core.entity_form_display.taxonomy_term.gbf_targets.default'] = {
  uuid: 'e19644ce-2db8-4f03-87c5-f84b6c78aed9',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.field.taxonomy_term.gbf_targets.field_identifier',
      'field.field.taxonomy_term.gbf_targets.field_longdescription',
      'field.field.taxonomy_term.gbf_targets.field_scbdtermid',
      'field.field.taxonomy_term.gbf_targets.field_shorttitle',
      'field.field.taxonomy_term.gbf_targets.field_url',
      'taxonomy.vocabulary.gbf_targets'
    ],
    module: [
      'path',
      'text'
    ]
  },
  id: 'taxonomy_term.gbf_targets.default',
  targetEntityType: 'taxonomy_term',
  bundle: 'gbf_targets',
  mode: 'default',
  content: {
    description: {
      type: 'text_textarea',
      weight: 3,
      region: 'content',
      settings: {
        rows: 5,
        placeholder: ''
      },
      third_party_settings: []
    },
    field_identifier: {
      type: 'string_textfield',
      weight: 0,
      region: 'content',
      settings: {
        size: 60,
        placeholder: ''
      },
      third_party_settings: []
    },
    field_longdescription: {
      type: 'string_textarea',
      weight: 4,
      region: 'content',
      settings: {
        rows: 5,
        placeholder: ''
      },
      third_party_settings: []
    },
    field_scbdtermid: {
      type: 'string_textfield',
      weight: 6,
      region: 'content',
      settings: {
        size: 60,
        placeholder: ''
      },
      third_party_settings: []
    },
    field_shorttitle: {
      type: 'string_textfield',
      weight: 2,
      region: 'content',
      settings: {
        size: 60,
        placeholder: ''
      },
      third_party_settings: []
    },
    field_url: {
      type: 'link_default',
      weight: 7,
      region: 'content',
      settings: {
        placeholder_url: '',
        placeholder_title: ''
      },
      third_party_settings: []
    },
    name: {
      type: 'string_textfield',
      weight: 1,
      region: 'content',
      settings: {
        size: 60,
        placeholder: ''
      },
      third_party_settings: []
    },
    path: {
      type: 'path',
      weight: 5,
      region: 'content',
      settings: [],
      third_party_settings: []
    }
  },
  hidden: {
    langcode: true,
    status: true
  }
};

configMap['core.entity_view_display.taxonomy_term.gbf_targets.default'] = {
  uuid: '6450aa6d-e35e-434e-bd2d-62dad6f3b633',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.field.taxonomy_term.gbf_targets.field_identifier',
      'field.field.taxonomy_term.gbf_targets.field_longdescription',
      'field.field.taxonomy_term.gbf_targets.field_scbdtermid',
      'field.field.taxonomy_term.gbf_targets.field_shorttitle',
      'field.field.taxonomy_term.gbf_targets.field_url',
      'taxonomy.vocabulary.gbf_targets'
    ],
    module: [
      'text'
    ]
  },
  id: 'taxonomy_term.gbf_targets.default',
  targetEntityType: 'taxonomy_term',
  bundle: 'gbf_targets',
  mode: 'default',
  content: {
    description: {
      type: 'text_default',
      label: 'hidden',
      settings: [],
      third_party_settings: [],
      weight: 2,
      region: 'content'
    },
    field_identifier: {
      type: 'string',
      label: 'above',
      settings: {
        link_to_entity: false
      },
      third_party_settings: [],
      weight: 0,
      region: 'content'
    },
    field_longdescription: {
      type: 'basic_string',
      label: 'above',
      settings: [],
      third_party_settings: [],
      weight: 3,
      region: 'content'
    },
    field_scbdtermid: {
      type: 'string',
      label: 'above',
      settings: {
        link_to_entity: false
      },
      third_party_settings: [],
      weight: 4,
      region: 'content'
    },
    field_shorttitle: {
      type: 'string',
      label: 'above',
      settings: {
        link_to_entity: false
      },
      third_party_settings: [],
      weight: 1,
      region: 'content'
    },
    field_url: {
      type: 'link',
      label: 'above',
      settings: {
        trim_length: 255,
        url_only: false,
        url_plain: false,
        rel: '',
        target: ''
      },
      third_party_settings: [],
      weight: 5,
      region: 'content'
    }
  },
  hidden: {
    langcode: true
  }
};

configMap['field.field.taxonomy_term.gbf_targets.field_identifier'] = {
  uuid: '9e9702c9-5708-4eaf-93dd-e6fbc0ceba3d',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.storage.taxonomy_term.field_identifier',
      'taxonomy.vocabulary.gbf_targets'
    ]
  },
  id: 'taxonomy_term.gbf_targets.field_identifier',
  field_name: 'field_identifier',
  entity_type: 'taxonomy_term',
  bundle: 'gbf_targets',
  label: 'Identifier',
  description: '',
  required: true,
  translatable: false,
  default_value: [],
  default_value_callback: '',
  settings: [],
  field_type: 'string'
};

configMap['field.field.taxonomy_term.gbf_targets.field_longdescription'] = {
  uuid: '510fe508-3935-48d4-a0fc-5c14ca8d417b',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.storage.taxonomy_term.field_longdescription',
      'taxonomy.vocabulary.gbf_targets'
    ]
  },
  id: 'taxonomy_term.gbf_targets.field_longdescription',
  field_name: 'field_longdescription',
  entity_type: 'taxonomy_term',
  bundle: 'gbf_targets',
  label: 'longDescription',
  description: '',
  required: true,
  translatable: false,
  default_value: [],
  default_value_callback: '',
  settings: [],
  field_type: 'string_long'
};

configMap['field.field.taxonomy_term.gbf_targets.field_scbdtermid'] = {
  uuid: '1cd27fe3-9eac-4ff5-8cf6-c76bf2931b26',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.storage.taxonomy_term.field_scbdtermid',
      'taxonomy.vocabulary.gbf_targets'
    ]
  },
  id: 'taxonomy_term.gbf_targets.field_scbdtermid',
  field_name: 'field_scbdtermid',
  entity_type: 'taxonomy_term',
  bundle: 'gbf_targets',
  label: 'scbdTermId',
  description: '',
  required: true,
  translatable: false,
  default_value: [],
  default_value_callback: '',
  settings: [],
  field_type: 'string'
};
configMap['field.field.taxonomy_term.gbf_targets.field_shorttitle'] = {
  uuid: '3b7a564d-c68d-4afa-985d-0e9110b039be',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.storage.taxonomy_term.field_shorttitle',
      'taxonomy.vocabulary.gbf_targets'
    ]
  },
  id: 'taxonomy_term.gbf_targets.field_shorttitle',
  field_name: 'field_shorttitle',
  entity_type: 'taxonomy_term',
  bundle: 'gbf_targets',
  label: 'shortTitle',
  description: '',
  required: true,
  translatable: false,
  default_value: [],
  default_value_callback: '',
  settings: [],
  field_type: 'string'
};
configMap['field.field.taxonomy_term.gbf_targets.field_url'] = {
  uuid: 'd619336c-60bb-4c08-873e-8bf180e50ad2',
  langcode: 'en',
  status: true,
  dependencies: {
    config: [
      'field.storage.taxonomy_term.field_url',
      'taxonomy.vocabulary.gbf_targets'
    ],
    module: [
      'link'
    ]
  },
  id: 'taxonomy_term.gbf_targets.field_url',
  field_name: 'field_url',
  entity_type: 'taxonomy_term',
  bundle: 'gbf_targets',
  label: 'URL',
  description: '',
  required: false,
  translatable: true,
  default_value: [],
  default_value_callback: '',
  settings: {
    title: 1,
    link_type: 17
  },
  field_type: 'link'
};
configMap['field.storage.taxonomy_term.field_longdescription'] = {
  uuid: 'c17a4092-93d9-44b3-ab48-212135a6929a',
  langcode: 'en',
  status: true,
  dependencies: {
    module: [
      'field_permissions',
      'taxonomy'
    ]
  },
  third_party_settings: {
    field_permissions: {
      permission_type: 'public'
    }
  },
  id: 'taxonomy_term.field_longdescription',
  field_name: 'field_longdescription',
  entity_type: 'taxonomy_term',
  type: 'string_long',
  settings: {
    case_sensitive: false
  },
  module: 'core',
  locked: false,
  cardinality: 1,
  translatable: true,
  indexes: [],
  persist_with_no_fields: false,
  custom_storage: false
};
configMap['field.storage.taxonomy_term.field_shorttitle'] = {
  uuid: '0c66d9b2-2803-4857-b1d1-964e7faec79e',
  langcode: 'en',
  status: true,
  dependencies: {
    module: [
      'field_permissions',
      'taxonomy'
    ]
  },
  third_party_settings: {
    field_permissions: {
      permission_type: 'public'
    }
  },
  id: 'taxonomy_term.field_shorttitle',
  field_name: 'field_shorttitle',
  entity_type: 'taxonomy_term',
  type: 'string',
  settings: {
    max_length: 512,
    case_sensitive: false,
    is_ascii: false
  },
  module: 'core',
  locked: false,
  cardinality: 1,
  translatable: true,
  indexes: [],
  persist_with_no_fields: false,
  custom_storage: false
};
configMap['field.storage.taxonomy_term.field_scbdtermid'] = {
  uuid: 'ce583c9c-f538-47e8-895e-40a059432d8c',
  langcode: 'en',
  status: true,
  dependencies: {
    module: [
      'field_permissions',
      'taxonomy'
    ]
  },
  third_party_settings: {
    field_permissions: {
      permission_type: 'public'
    }
  },
  id: 'taxonomy_term.field_scbdtermid',
  field_name: 'field_scbdtermid',
  entity_type: 'taxonomy_term',
  type: 'string',
  settings: {
    max_length: 5,
    case_sensitive: false,
    is_ascii: false
  },
  module: 'core',
  locked: false,
  cardinality: 1,
  translatable: true,
  indexes: [],
  persist_with_no_fields: false,
  custom_storage: false
};
configMap['field.storage.taxonomy_term.field_identifier'] = {
  uuid: '63d6d262-d3ff-4a42-bb9b-7ca234c798bd',
  langcode: 'en',
  status: true,
  dependencies: {
    module: [
      'field_permissions',
      'taxonomy'
    ]
  },
  third_party_settings: {
    field_permissions: {
      permission_type: 'public'
    }
  },
  id: 'taxonomy_term.field_identifier',
  field_name: 'field_identifier',
  entity_type: 'taxonomy_term',
  type: 'string',
  settings: {
    max_length: 255,
    case_sensitive: false,
    is_ascii: false
  },
  module: 'core',
  locked: false,
  cardinality: 1,
  translatable: true,
  indexes: [],
  persist_with_no_fields: false,
  custom_storage: false
};

const targetTemplate = {
  type: 'taxonomy_term--gbf_targets',
  attributes: {
    // "name": "",
    // "description": {
    //     "value": "",
    //     "format": "basic_html"
    // },
    // "weight": 0,
    // "revision_translation_affected": true,
    // "content_translation_source": "und",
    // "content_translation_outdated": false,
    // "field_identifier": "",
    // "field_longdescription": "",
    // "field_scbdtermid": "",
    // "field_shorttitle": "",
    // "field_url": { uri: '', title: '' }
  },
  relationships: {
    vid: {
      data: {
        type: 'taxonomy_vocabulary--taxonomy_vocabulary',
        id: 'd0723b81-5721-4134-be5c-1497f24fc540'
      }
    }
  }
};

function formatTarget ({ identifier, title, description, shortTitle, longDescription, termId }) {
  const target = clone(targetTemplate);

  /* eslint-disable camelcase */

  target.attributes.field_identifier = identifier;
  target.attributes.name = `Target ${getNumber(identifier)}`;
  target.attributes.description = {};
  target.attributes.description.value = description;
  target.attributes.field_longdescription = longDescription.en;
  target.attributes.field_shorttitle = shortTitle.en;
  target.attributes.field_scbdtermid = termId;
  target.attributes.field_url = {};
  target.attributes.field_url.uri = `https://www.cbd.int/gbf/targets/${getNumber(identifier)}`;
  target.attributes.field_url.title = `Target ${getNumber(identifier)} - Kunming-Montreal Global Biodiversity Framework`;
  target.attributes.weight = getNumber(identifier) + 10;

  /* eslint-disable camelcase */

  return target;
}

function getNumber (id) {
  if (id.includes('AICHI-TARGET-')) { return Number(id.replace('AICHI-TARGET-', '')); }
  if (id.includes('GBF-TARGET-')) { return Number(id.replace('GBF-TARGET-', '')); }
}

const field_url = { type: 'link', bundles: { planning_item_type: 'planning_item_type', gbf_targets: 'gbf_targets' } };
const field_identifier = { type: 'string', bundles: { gbf_targets: 'gbf_targets' } };
const field_shorttitle = { type: 'string', bundles: { gbf_targets: 'gbf_targets' } };
const field_longdescription = { type: 'string_long', bundles: { gbf_targets: 'gbf_targets' } };
const field_scbdtermid = { type: 'string', bundles: { gbf_targets: 'gbf_targets' } };

function updateFieldMapObject (obj) {
  return { ...obj, field_url, field_identifier, field_shorttitle, field_longdescription, field_scbdtermid };
}

using CatalogService from './cat-service';
annotate CatalogService.Books with @(
  UI.HeaderInfo: {
    TypeName      : 'Aktie',
    TypeNamePlural: 'Aktien',
    Title         : { Value: name }
  },
  UI.SelectionFields: [ name, preis ],
  UI.LineItem: [
    { Value: name,  Label: 'name'  },
    { Value: preis, Label: 'preis' },
    { Value: dividenden,  Label: 'dividenden'  },
    { Value: jahr,  Label: 'jahr'  },
    { Value: woche,  Label: 'woche'  }
  ],
  UI.FieldGroup#Main: {
    Label: 'Aktien Details',
    Data : [
      { Value: name  },
      { Value: preis },
      { Value: dividenden  },
      { Value: jahr  },
      { Value: woche  }
    ]
  },
  UI.Facets: [{
    $Type : 'UI.ReferenceFacet',
    Label : 'Details',
    Target: '@UI.FieldGroup#Main'
  }],
  UI.Identification: [{
    $Type : 'UI.DataFieldForAction',
    Action: 'CatalogService.restock',
    Label : 'Restock'
  }]
);
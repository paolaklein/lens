
export type AstElement = AstTopLayer | AstBottomLayerValue

export type AstTopLayer = {
  operand: 'AND' | 'OR',
  children: AstElement[]
}

export type AstBottomLayerValue = {
  key: string;
  type: string;
  system?: string;
  value: string | boolean | Array<string> | {min: number, max: number} | {min: Date | undefined, max: Date | undefined}
}

export type Criteria = {
  key: string;
  name: string;
  description?: string;
  aggregatedValue?: AggregatedValue[][]
}

export type AggregatedValue = {
  value: string;
  name: string;
  type: string;
  system?: string;
}


type Measure = {
    key: string;
    measure: object;
    cql: string;
  };
  

let codesystems: string[] = []
let aliasMap: any = {}
let cqltemplate: any = {}
let criterionMap: any = {}
let criteria: Criteria[]

export const translateAstToCql = (
    params: 
    {
      query: AstTopLayer,
      returnOnlySingeltons: boolean,
      backendMeasures: string,
      measuresCql: Measure[],
      aliasMap: any,
      cqltemplate: any,
      criterionMap: any,
      criteria: Criteria[]
    }
  ): string => {
  
    /**
     * TODO: make configurable via options
     */
  
    aliasMap = params.aliasMap
    cqltemplate = params.cqltemplate
    criterionMap = params.criterionMap
    criteria = params.criteria
  
    const { query, returnOnlySingeltons, backendMeasures, measuresCql } = params
  

    /**
     * works as config
     */
    codesystems = [
      // NOTE: We always need loinc, as the Deceased Stratifier is computed with it!!!
      "codesystem loinc: 'http://loinc.org'",
      "codesystem icd10: 'http://hl7.org/fhir/sid/icd-10'",
      "codesystem SampleMaterialType: 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType'",
    ];
    
    const cqlHeader =
      'library Retrieve\n' +
      "using FHIR version '4.0.0'\n" +
      "include FHIRHelpers version '4.0.0'\n" +
      '\n';

    
    let singletons = backendMeasures + '\n';
    singletons += resolveOperation(query) 


    if (query.children.length == 0) {
        singletons += "\ntrue"
    }
    
    if (returnOnlySingeltons) {
        return singletons
    }
    
    /**
     * special logic for specimen
     */
    let retrievalCriteria: string = 'if InInitialPopulation then ';
    let additionalCriteria: string = '';

    query.children.forEach((criterion: AstElement) => {
      additionalCriteria += getRetrievalCriterion(criterion);
    });

    if (
      additionalCriteria == '' ||
      additionalCriteria.substring(additionalCriteria.length - 1) == '('
    ) {
      retrievalCriteria += '[Specimen]';
    } else if (
      additionalCriteria.substring(additionalCriteria.length - 9) == 'intersect'
    ) {
      retrievalCriteria += '[Specimen] S where ' + additionalCriteria;
      retrievalCriteria = retrievalCriteria.slice(0, -10);
    } else {
      retrievalCriteria += '[Specimen] S where ' + additionalCriteria;
      retrievalCriteria = retrievalCriteria.slice(0, -5);
    }

    retrievalCriteria = retrievalCriteria += ' else {} as List<Specimen>';

    /**
     * gets the cql from the measures and adds the retrieval criteria for specimen
     */
    const measures = measuresCql.map((measure: Measure) => {
        if (measure.key === 'bbmri-specimen') {
            return `${measure.cql}    ${retrievalCriteria}\n\n`;
        }
        return measure.cql;
    })


    return cqlHeader +
        getCodesystems() +
        "context Patient\n" +
        measures.join('') +
        singletons
  }


  const resolveOperation = (operation: AstElement): string => {

    let expression: string = "";
  
    if ('children' in operation && operation.children.length > 1) {
      expression += "("
    }
  
    'children' in operation && operation.children.forEach((element: AstElement, index) => {
      if ('children' in element) {
        expression += resolveOperation(element)
      }
      if ('key' in element && 'type' in element && 'system' in element && 'value' in element) {
        expression += getSingleton(element)
      }
      if (index < operation.children.length - 1) {
        expression += ")" + ` ${operation.operand.toLowerCase()} ` + "\n("
      } else {
        if (operation.children.length > 1) { expression += ")" }
      }
    })
  
    return expression
  }
  

const getSingleton = (criterion: AstBottomLayerValue): string => {
let expression: string = '';

const myCriterion = criterionMap[criterion.key];

if (myCriterion) {

    const myCQL = cqltemplate[myCriterion.type]
    if (myCQL) {
        expression += '(';
        switch (myCriterion.type) {
        case 'gender': {
            if (typeof criterion.value === "string") {
                // TODO: Check if we really need to do this or we can somehow tell cql to do that expansion it self
                if (criterion.value.slice(-1) === "%") {
                  const mykey = criterion.value.slice(0, -2)
                  if (criteria != undefined) {
                    let expandedValues = criteria
                      .filter(value => value.startsWith(mykey))
                    expression += getSingleton(
                      {
                        key: criterion.key,
                        type: criterion.type,
                        system: criterion.system,
                        value: expandedValues,
                      }
                    )
                  }
                } else {
                  expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value as string)
                }
              }
              if (typeof criterion.value === "boolean") {
                expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL)
              }
     
     
              if (criterion.value instanceof Array) {
                if (criterion.value.length === 1) {
                  expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value[0])
                } else {
                  criterion.value.forEach((value: string) => {
                    expression += "(" + substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, value) + ") or\n"
                  })
                  expression = expression.slice(0, -4)
                }
              }
     
     
              break
            }
        case 'observationSmoker': {
            if (typeof criterion.value === 'string') {
            if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                let expandedValues = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                expression += getSingleton(
                    new Condition(
                    criterion.key,
                    criterion.type,
                    criterion.system,
                    expandedValues
                    )
                ).substring(1);
                }
            } else {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                ) + ') and\n';
            }
            }

            if (criterion.value instanceof Array<string>) {
            var values: string[] = [];

            if (criterion.value.includes('Smoker')) {
                values.push(
                'LA18976-3',
                'LA18977-1',
                'LA18981-3',
                'LA18982-1'
                );
            }

            if (criterion.value.includes('Former Smoker')) {
                values.push('LA15920-4', 'LA18979-7');
            }

            if (criterion.value.includes('Never Smoked')) {
                values.push('LA18978-9');
            }

            if (criterion.value.includes('Uncharted smoking habit')) {
                values.push('LA18980-5');
            }

            if (values.length === 1) {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                ) + ') and\n';
            } else {
                values.forEach((value: string) => {
                expression +=
                    '(' +
                    substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
            }
            }
            break;
        }
        case 'conditionValue':
        case 'conditionSampleDiagnosis':
        case 'observationBodyWeight':
        case 'observationBMI': {
            let newCQL: string = '';
            if (
            typeof criterion.value == 'object' &&
            !(criterion.value instanceof Array<string>)
            ) {
            if (!criterion.value.min) {
                newCQL = myCQL.replace(
                'between Ceiling({{D1}}) and Ceiling({{D2}})',
                '<= Ceiling({{D2}})'
                );
            } else if (!criterion.value.max) {
                newCQL = myCQL.replace(
                'between Ceiling({{D1}}) and Ceiling({{D2}})',
                '>= Ceiling({{D1}})'
                );
            } else {
                newCQL = myCQL;
            }
            expression +=
                substituteCQLExpression(
                criterion.key,
                myCriterion.alias,
                newCQL,
                '',
                criterion.value.max as number,
                criterion.value.min as number
                ) + ') and\n';
            }
            break;
        }
        case 'specimen':
        case 'storageTemperature':
        case 'fastingStatus': {
            if (typeof criterion.value === 'string') {
            if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                let expandedValues = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                expression += getSingleton(
                    new Condition(
                    criterion.key,
                    criterion.type,
                    criterion.system,
                    expandedValues
                    )
                ).substring(1);
                }
            } else {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                ) + ') and\n';
            }
            }

            if (criterion.value instanceof Array<string>) {
            var values: string[] = [];

            if (criterion.value.includes('Sober')) {
                values.push(
                'F',
                );
            }

            if (criterion.value.includes('Not sober')) {
                values.push('NF');
            }

            if (criterion.value.includes('Other fasting status')) {
                values.push('NG');
            }

            if (criterion.value.includes('Uncharted fasting status')) {
                values.push('FNA');
            }

            if (values.length === 1) {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                ) + ') and\n';
            } else {
                values.forEach((value: string) => {
                expression +=
                    '(' +
                    substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
            }
            }
            break;
        }
        //die sind anders
        case 'observation':
        case 'hasSpecimen': {
            if (typeof criterion.value === 'string') {
            if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                    let expandedValues = criteria.values
                        .filter((value) => value.key.indexOf(mykey) != -1)
                        .map((value) => value.key);
                    expression += getSingleton(
                        new Condition(
                        criterion.key,
                        criterion.type,
                        criterion.system,
                        expandedValues
                        )
                    ).substring(1);
                }
            } else {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                ) + ') and\n';
            }
            }
            if (typeof criterion.value === 'boolean') {
            expression +=
                substituteCQLExpression(
                criterion.key,
                myCriterion.alias,
                myCQL
                ) + ') and\n';
            }
            if (criterion.value instanceof Array<string>) {
            var values: string[] = [];
            criterion.value.forEach((element) => {
                values.push(element);
            });

            if (myCriterion.type == 'hasSpecimen') {
                if (criterion.value.includes('blood-plasma')) {
                values.push(
                    'plasma-edta',
                    'plasma-citrat',
                    'plasma-heparin',
                    'plasma-cell-free',
                    'plasma-other',
                    'plasma'
                );
                }
                if (criterion.value.includes('blood-serum')) {
                values.push('serum');
                }
                if (criterion.value.includes('tissue-ffpe')) {
                values.push(
                    'tumor-tissue-ffpe',
                    'normal-tissue-ffpe',
                    'other-tissue-ffpe',
                    'tissue-formalin'
                );
                }
                if (criterion.value.includes('tissue-frozen')) {
                values.push(
                    'tumor-tissue-frozen',
                    'normal-tissue-frozen',
                    'other-tissue-frozen'
                );
                }
                if (criterion.value.includes('dna')) {
                values.push('cf-dna', 'g-dna');
                }
                if (criterion.value.includes('tissue-other')) {
                values.push('tissue-paxgene-or-else', 'tissue');
                }
                if (criterion.value.includes('derivative-other')) {
                values.push('derivative');
                }
                if (criterion.value.includes('liquid-other')) {
                values.push('liquid');
                }
            }
            if (values.length === 1) {
                expression +=
                substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                ) + ') and\n';
            } else {
                values.forEach((value: string) => {
                expression +=
                    '(' +
                    substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
            }
            }
            break;
        }
        case 'observationRange':
        case 'conditionRangeAge':
        case 'age': {
            let newCQL: string = '';
            if (
            typeof criterion.value == 'object' &&
            !(criterion.value instanceof Array<string>)
            ) {
            if (!criterion.value.min) {
                newCQL = myCQL.replace(
                'between Ceiling({{D1}}) and Ceiling({{D2}})',
                '<= Ceiling({{D2}})'
                );
            } else if (!criterion.value.max) {
                newCQL = myCQL.replace(
                'between Ceiling({{D1}}) and Ceiling({{D2}})',
                '>= Ceiling({{D1}})'
                );
            } else {
                newCQL = myCQL;
            }
            expression +=
                substituteCQLExpression(
                criterion.key,
                myCriterion.alias,
                newCQL,
                '',
                criterion.value.min as number,
                criterion.value.max as number
                ) + ') and\n';
            }
            break;
        }

        case 'samplingDate':
        case 'conditionRangeDate': {
            let newCQL: string = '';
            if (
            typeof criterion.value == 'object' &&
            !(criterion.value instanceof Array) &&
            (criterion.value.min instanceof Date ||
                criterion.value.max instanceof Date)
            ) {
            if (!(criterion.value.min instanceof Date)) {
                newCQL = myCQL.replace(
                'between {{D1}} and {{D2}}',
                '<= {{D2}}'
                );
            } else if (!(criterion.value.max instanceof Date)) {
                newCQL = myCQL.replace(
                'between {{D1}} and {{D2}}',
                '>= {{D1}}'
                );
            } else {
                newCQL = myCQL;
            }
            expression +=
                substituteCQLExpressionDate(
                criterion.key,
                myCriterion.alias,
                newCQL,
                '',
                criterion.value.min as Date,
                criterion.value.max as Date
                ) + ') and\n';
            }
            break;
        }
        }
    }
}

return expression;
}

const  getCodesystems = (): string =>{
    let codesystems: string = '';

    new Set(codesystems).forEach((systems) => {
      codesystems += systems + '\n';
    });
    if (codesystems.length > 0) {
      codesystems += '\n';
    }
    return codesystems;
  }


const getRetrievalCriterion = (criterion: Operation | Condition): string => {
    let expression: string = '';
    let myCQL: string = '';
    if (criterion instanceof Condition) {
      const myCriterion = criterionMap.get(criterion.key);
      if (myCriterion) {
        switch (myCriterion.type) {
          case 'specimen': {
            expression += '(';
            myCQL += cqltemplate.get('retrieveSpecimenByType');
            if (typeof criterion.value === 'string') {
              if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                  criterion.value = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                  getRetrievalCriterion(criterion);
                }
              } else {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                  ) + ') and\n';
              }
            }
            if (criterion.value instanceof Array<string>) {
              var values: string[] = [];
              criterion.value.forEach((element) => {
                values.push(element);
              });

              if (criterion.value.includes('blood-plasma')) {
                values.push(
                  'plasma-edta',
                  'plasma-citrat',
                  'plasma-heparin',
                  'plasma-cell-free',
                  'plasma-other',
                  'plasma'
                );
              }
              if (criterion.value.includes('blood-serum')) {
                values.push('serum');
              }
              if (criterion.value.includes('tissue-ffpe')) {
                values.push(
                  'tumor-tissue-ffpe',
                  'normal-tissue-ffpe',
                  'other-tissue-ffpe',
                  'tissue-formalin'
                );
              }
              if (criterion.value.includes('tissue-frozen')) {
                values.push(
                  'tumor-tissue-frozen',
                  'normal-tissue-frozen',
                  'other-tissue-frozen'
                );
              }
              if (criterion.value.includes('dna')) {
                values.push('cf-dna', 'g-dna');
              }
              if (criterion.value.includes('tissue-other')) {
                values.push('tissue-paxgene-or-else', 'tissue');
              }
              if (criterion.value.includes('derivative-other')) {
                values.push('derivative');
              }
              if (criterion.value.includes('liquid-other')) {
                values.push('liquid');
              }

              if (values.length === 1) {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                  ) + ') and\n';
              } else {
                values.forEach((value: string) => {
                  expression +=
                    '(' +
                    substituteCQLExpression(
                      criterion.key,
                      myCriterion.alias,
                      myCQL,
                      value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
              }
            }
            break;
          }
          case 'storageTemperature': {
            expression += '(';
            myCQL += cqltemplate.get('retrieveSpecimenByTemperature');
            if (typeof criterion.value === 'string') {
              if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                  criterion.value = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                  getRetrievalCriterion(criterion);
                }
              } else {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                  ) + ') and\n';
              }
            }
            if (criterion.value instanceof Array<string>) {
              if (criterion.value.length === 1) {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value[0]
                  ) + ') and\n';
              } else {
                criterion.value.forEach((value: string) => {
                  expression +=
                    '(' +
                    substituteCQLExpression(
                      criterion.key,
                      myCriterion.alias,
                      myCQL,
                      value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
              }
            }
            break;
          }
          case 'fastingStatus': {
            expression += '(';
            myCQL += cqltemplate.get('retrieveSpecimenByFastingStatus');
            if (typeof criterion.value === 'string') {
              if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                  criterion.value = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                  getRetrievalCriterion(criterion);
                }
              } else {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                  ) + ') and\n';
              }
            }
            if (criterion.value instanceof Array<string>) {
              var values: string[] = [];
              criterion.value.forEach((element) => {
                values.push(element);
              });

              if (criterion.value.includes('Sober')) {
                values.push('F');
              }

              if (criterion.value.includes('Not sober')) {
                values.push('NF');
              }

              if (criterion.value.includes('Other fasting status')) {
                values.push('NG');
              }

              if (criterion.value.includes('Uncharted fasting status')) {
                values.push('FNA');
              }
              if (values.length === 1) {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                  ) + ') and\n';
              } else {
                values.forEach((value: string) => {
                  expression +=
                    '(' +
                    substituteCQLExpression(
                      criterion.key,
                      myCriterion.alias,
                      myCQL,
                      value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
              }
            }
            break;
          }
          case 'samplingDate': {
            expression += '(';
            myCQL += cqltemplate.get('retrieveSpecimenBySamplingDate');

            let newCQL: string = '';
            if (
              typeof criterion.value == 'object' &&
              !(criterion.value instanceof Array) &&
              (criterion.value.min instanceof Date ||
                criterion.value.max instanceof Date)
            ) {
              if (!(criterion.value.min instanceof Date)) {
                newCQL = myCQL.replace(
                  'between {{D1}} and {{D2}}',
                  '<= {{D2}}'
                );
              } else if (!(criterion.value.max instanceof Date)) {
                newCQL = myCQL.replace(
                  'between {{D1}} and {{D2}}',
                  '>= {{D1}}'
                );
              } else {
                newCQL = myCQL;
              }
              expression +=
                substituteCQLExpressionDate(
                  criterion.key,
                  myCriterion.alias,
                  newCQL,
                  '',
                  criterion.value.min as Date,
                  criterion.value.max as Date
                ) + ') and\n';
            }
            break;
          }
          case 'observationSmoker': {
            expression += '(';

            myCQL += cqltemplate.get('observationSmoker');

            if (typeof criterion.value === 'string') {
              if (criterion.value.slice(-1) === '%') {
                const mykey = criterion.value.slice(0, -2);
                if (criteria.values != undefined) {
                  criterion.value = criteria.values
                    .filter((value) => value.key.indexOf(mykey) != -1)
                    .map((value) => value.key);
                  getRetrievalCriterion(criterion);
                }
              } else {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    criterion.value as string
                  ) + ') and\n';
              }
            }
            if (criterion.value instanceof Array<string>) {
              var values: string[] = [];
              criterion.value.forEach((element) => {
                values.push(element);
              });

              if (criterion.value.includes('Smoker')) {
                values.push('LA18976-3', 'LA18977-1', 'LA18981-3', 'LA18982-1');
              }

              if (criterion.value.includes('Former smoker')) {
                values.push('LA15920-4', 'A18979-7');
              }

              if (criterion.value.includes('Never smoked')) {
                values.push('LA18978-9');
              }

              if (criterion.value.includes('Uncharted smoking habit')) {
                values.push('LA18980-5');
              }
              if (values.length === 1) {
                expression +=
                  substituteCQLExpression(
                    criterion.key,
                    myCriterion.alias,
                    myCQL,
                    values[0]
                  ) + ') and\n';
              } else {
                values.forEach((value: string) => {
                  expression +=
                    '(' +
                    substituteCQLExpression(
                      criterion.key,
                      myCriterion.alias,
                      myCQL,
                      value
                    ) +
                    ') or\n';
                });
                expression = expression.slice(0, -4) + ') and\n';
              }
            }
            break;
          }
        }
      }
    }
    return expression;
  }

const substituteCQLExpressionDate = (
    key: string,
    alias: string[] | undefined,
    cql: string,
    value?: string,
    min?: Date,
    max?: Date
  ): string => {
    let cqlString: string;
    if (value) {
      cqlString = cql.replace(new RegExp('{{C}}'), value);
      while (cqlString.search('{{C}}') != -1) {
        cqlString = cqlString.replace(new RegExp('{{C}}'), value);
      }
    } else {
      cqlString = cql;
    }
    cqlString = cqlString.replace(new RegExp('{{K}}'), key);
    if (alias && alias[0]) {
      cqlString = cqlString.replace(new RegExp('{{A1}}', 'g'), alias[0]);
      if (alias[0] != 'icd10' && alias[0] != 'SampleMaterialType') {
        const systemExpression =
          'codesystem ' + alias[0] + ": '" + alias.get(alias[0]) + "'";
        if (!codesystems.includes(systemExpression)) {
          //this doesn't work
          codesystems.push(systemExpression);
        }
      }
    }
    if (alias && alias[1]) {
      cqlString = cqlString.replace(new RegExp('{{A2}}', 'g'), alias[1]);
      const systemExpression =
        'codesystem ' + alias[1] + ": '" + alias.get(alias[1]) + "'";
      if (!codesystems.includes(systemExpression)) {
        codesystems.push(systemExpression);
      }
    }
    if (min) {
      cqlString = cqlString.replace(
        new RegExp('{{D1}}'),
        '@' + formatDate(min, 'yyyy-MM-dd', 'en_US')
      );
    }
    if (max) {
      cqlString = cqlString.replace(
        new RegExp('{{D2}}'),
        '@' + formatDate(max, 'yyyy-MM-dd', 'en_US')
      );
    }
    return cqlString;
  }

  const substituteCQLExpression = (
    key: string,
    alias: string[] | undefined,
    cql: string,
    value?: string,
    min?: number,
    max?: number
  ): string => {
    let cqlString: string;
    if (value) {
      cqlString = cql.replace(new RegExp('{{C}}'), value);
      while (cqlString.search('{{C}}') != -1) {
        cqlString = cqlString.replace(new RegExp('{{C}}'), value);
      }
    } else {
      cqlString = cql;
    }
    cqlString = cqlString.replace(new RegExp('{{K}}'), key);
    if (alias && alias[0]) {
      cqlString = cqlString.replace(new RegExp('{{A1}}', 'g'), alias[0]);
      if (alias[0] != 'icd10' && alias[0] != 'SampleMaterialType') {
        const systemExpression =
          'codesystem ' + alias[0] + ": '" + alias.get(alias[0]) + "'";
        if (!codesystems.includes(systemExpression)) {
          //this doesn't work
          codesystems.push(systemExpression);
        }
      }
    }
    if (alias && alias[1]) {
      cqlString = cqlString.replace(new RegExp('{{A2}}', 'g'), alias[1]);
      const systemExpression =
        'codesystem ' + alias[1] + ": '" + alias.get(alias[1]) + "'";
      if (!codesystems.includes(systemExpression)) {
        codesystems.push(systemExpression);
      }
    }
    if (min) {
      cqlString = cqlString.replace(new RegExp('{{D1}}'), min.toString());
    }
    if (max) {
      cqlString = cqlString.replace(new RegExp('{{D2}}'), max.toString());
    }
    return cqlString;
  }

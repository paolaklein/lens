

import type { AstTopLayer } from "../types/ast";
import { getCriteria } from "../stores/catalogue";
import type { Measure } from '../types/backend';
import { measureStore } from '../stores/measures';
import { cqlStore } from "../stores/cqlStore";
import { cqlMappingStore } from "../stores/mappings";


/**
 * Get all cql from the project specific measures from the store
 */
let measuresCql: string[] = []

measureStore.subscribe((measures: Measure[]) => {
  measuresCql = measures.map(measure => measure.cql)
})

/**
 * gets the mappings from the cqlMappingStore passed via options component
 */
let aliasMap, cqltemplate, criterionMap

cqlMappingStore.subscribe((mappings) => {
    aliasMap = mappings.alias
    cqltemplate = mappings.cqltemplate
    criterionMap = mappings.criterionMap
  })

/**
 * Sets an event listener which will listen for responses to the retrieveCql function emit
 */
export const setCqlRetrieveListener = () => {
    document.addEventListener('sendCql', (event: CustomEvent) => {
        cqlStore.set(event.detail);
    });
}

/**
 * dispatches an event containing the ast and the mappings to the cql translator which is handled in the project itself
 * because the cql translator is project specific
 * DISCUSS: what needs to be configurable from the project?
 * @param query the query to be translated
 * @param returnOnlySingeltons option to return only the query without the cql header, measures and codesystems
 * @param backendMeasures the project specific measures to be included in the cql
 */
export const retrieveCql = (query: AstTopLayer, returnOnlySingeltons: boolean = true, backendMeasures: string) => {

    const requestEvent = new CustomEvent('retrieveAst', {
        detail: {
            query: query,
            returnOnlySingeltons: returnOnlySingeltons,
            backendMeasures: backendMeasures,
            measuresCql: measuresCql,
            aliasMap: aliasMap,
            cqltemplate: cqltemplate,
            criterionMap: criterionMap,
            criteria: getCriteria("diagnosis")
        }
    });
    document.dispatchEvent(requestEvent);
}
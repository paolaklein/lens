export type QueryItem = {
    id: string;
    key: string;
    name: string;
    values: QueryValue[];
    description?: string;
}

export type QueryValue = {
    name: string;
    value: string | {min: number, max: number};
}

export type AutoCompleteItem = {
    name: string;
    key: string;
    criterion: {
        key: string;
        name: string;
        description?: string;
    };
};

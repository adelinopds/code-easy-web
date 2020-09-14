import { Utils, IconWarning, IconError } from "code-easy-components";

import { IProperty } from "../components/properties-editor";
import { EComponentType, PropertieTypes } from "../enuns";
import { FlowItemComponent } from "./FlowItemComponent";
import { ITreeItem } from "../components/tree-manager";
import { EItemType } from "../components/flow-editor";
import { ITreeItemComponent } from "../interfaces";
import { DefaultPropsHelper } from "../services";

export class TreeItemComponent implements ITreeItemComponent {
    public name: string;
    public label: string;
    public ordem: number;
    public isEditing: boolean;
    public isSelected: boolean;
    public isExpanded: boolean;
    public description: string;
    public type: EComponentType;
    public id: string | undefined;
    public properties: IProperty[];
    public items: FlowItemComponent[];
    public itemPaiId: string | undefined;
    public updatedDate: Date = new Date();
    public createdDate: Date = new Date();

    constructor(
        private _fields: ITreeItemComponent
    ) {
        this.id = this._fields.id;
        this.updatedDate = new Date();
        this.type = this._fields.type;
        this.label = this._fields.label;
        this.ordem = this._fields.ordem || 0;
        this.itemPaiId = this._fields.itemPaiId;
        this.isEditing = this._fields.isEditing;
        this.isSelected = this._fields.isSelected;
        this.description = this._fields.description;
        this.properties = this._fields.properties || [];
        this.isExpanded = Boolean(this._fields.isExpanded);
        this.name = Utils.getNormalizedString(this._fields.name || '');
        this.createdDate = this._fields.createdDate || this.createdDate;
        this.items = this._fields.items.map(item => new FlowItemComponent(item));

        this._updateProperties(this._fields.properties || [], this._fields.type);
    }

    /**
     * Encontra as possíveis inconsistências que poderão em erros no código fonte final
     */
    public getProblems(): ITreeItem[] {
        let problems: ITreeItem[] = [];

        const addProblem = (label: string, type: 'warning' | 'error') => {
            problems.push({
                icon: type === 'warning' ? IconWarning : IconError,
                isDisabledSelect: true,
                nodeExpanded: false,
                isSelected: false,
                id: undefined,
                iconSize: 15,
                type: "ITEM",
                label,
            });
        };

        // Valida o label
        if (this.label === '') {
            addProblem('Field Label cannot be empty', 'error');
        } else if (this.label.length < 3) {
            addProblem(`Field Label cannot be less than 3 characters in "${this.label}"`, 'error');
        } else if (this.label.length > 50) {
            addProblem(`Field Label cannot exceed 50 characters in "${this.label}"`, 'error');
        }

        if (this.type !== EComponentType.routerConsume) {

            // Valida o numero de starts na tela
            let numStarts = this.items.filter(itemFlow => itemFlow.itemType === EItemType.START);
            if (numStarts.length > 1) {
                addProblem(`In ${this.label} must have only start flow item`, 'error');
                numStarts.forEach(start => start.hasError = true);
            } else {
                numStarts.forEach(start => start.hasError = false);
            }

            // Valida se encontra um start e um end na tela
            if (this.type === EComponentType.globalAction || this.type === EComponentType.localAction || this.type === EComponentType.routerExpose) {
                if (!(this.items.some(comp => comp.itemType === EItemType.START) && this.items.some(comp => comp.itemType === EItemType.END))) {
                    addProblem(`A "${this.type}" must be have a "Start" and an "End" item in "${this.label}"`, 'error');
                }
            }

            // Valida os ends
            let unusedEnd = this.items.find(itemFlow => (itemFlow.itemType === EItemType.END) && !this.items.some(flowItem => flowItem.connections.some(connection => connection.targetId === itemFlow.id)));
            if (unusedEnd) {
                addProblem(`In "${this.label}" a "${unusedEnd.name}" flow item is not used`, 'error');
                unusedEnd.hasError = true;
            }

        }

        return problems;
    }

    private _updateProperties(properties: IProperty[], type: EComponentType) {

        // Remove o auto focus caso exista em alguma prop
        this.properties.forEach(prop => prop.focusOnRender = false);

        const originalProperties = DefaultPropsHelper.getNewProps(type, this.label, (this.type === EComponentType.routerConsume || this.type === EComponentType.routerExpose));

        originalProperties.forEach(originalProp => {
            if (!properties.some(prop => prop.propertieType === originalProp.propertieType)) {
                properties.push(originalProp);
            }
        });

        switch (this.type) {
            case EComponentType.globalAction:
                this._globalAction();
                break;

            default:
                break;
        }

        this.properties = properties;
    }

    private _globalAction() {

        /** Define o nome da label encontrado nas properties do componente */
        const propLabel = this.properties.find(prop => prop.propertieType === PropertieTypes.label);
        if (propLabel) {
            this.name = Utils.getNormalizedString(propLabel.value);
        }

    }
}
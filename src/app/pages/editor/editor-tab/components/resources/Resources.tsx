import React, { useContext } from 'react';

import { TabButton, TabGroup } from '../../../../../shared/components/tab-button/TabButton';
import { CodeEditorContext } from '../../../../../shared/services/contexts/CodeEditorContext';
import { Tab, Component } from '../../../../../shared/interfaces/Aplication';
import { TreeInterface } from '../../../../../shared/components/tree/TreeInterface';
import { Tree } from '../../../../../shared/components/tree/Tree';
import "./Resources.scss";

export const ResourcesTree = () => {
    const codeEditorContext = useContext(CodeEditorContext);

    // Busca a tab selecionada no momento, se trocar a tab altera esta valor também.
    const currentTab: Tab = codeEditorContext.getCurrentTabSelected();
    const currentTabTree: TreeInterface[] = codeEditorContext.getCurrentTabTree();

    const onItemClick = (itemId: number) => {
        let component: Component = codeEditorContext.getComponentById(itemId);
        component.configs.isExpanded = !component.configs.isExpanded;
        codeEditorContext.changeComponentState(component.id, component);
    }

    const onItemDoubleClick = (itemId: number) => {

        codeEditorContext.getCurrentTabSelected().itens.forEach((c: Component) => {
            if (c.configs.isEditando === true) {
                c.configs.isEditando = false;
                codeEditorContext.changeComponentState(c.id, c);
            }
        });

        let component: Component = codeEditorContext.getComponentById(itemId);
        component.configs.isEditando = true;
        codeEditorContext.changeComponentState(component.id, component);
    }

    return (
        <div style={{ width: "100%", flexDirection: "column" }}>
            <div className="tree-body" style={{ display: currentTab.configs.type === codeEditorContext.editingTab ? "block" : "none" }}>
                {currentTabTree.map((tree) => {
                    return <Tree treeItem={tree} onItemClick={onItemClick} onItemDoubleClick={onItemDoubleClick} />;
                })}
            </div>
        </div>
    );
}

export default ResourcesTree;

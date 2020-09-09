import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { CenterLoadingIndicator } from '../components/loading-indicator/LoadingIndicator';
import { ProjectsStorage } from '../services/storage/ProjectsStorage';
import { ProblemsHelper } from '../services/helpers/ProblemsHelper';
import { Project, ItemComponent } from '../interfaces';
import { ComponentType } from '../enuns';

export interface ICodeEditorContext {
    project: Project,
    setProject(project: Project): void,
}
const CodeEditorContext = React.createContext<ICodeEditorContext>({} as ICodeEditorContext);

export const CodeEditorProvider: React.FC = ({ children }) => {

    const history = useHistory();
    const { id } = useParams();

    /** Usada para atualizar o state global do projeto e para atualizar o localstorage */
    const handleSetProject = useCallback((project: Project) => {

        // Valida o projeto e encontra os problemas
        project = ProblemsHelper.getProblems(project).project;

        // WindowsTabsManager
        project = ProjectsStorage.updateWindowTabs(project);

        // Salva a nova versão do projeto no local storage
        ProjectsStorage.setProjectById(project);

        // Atualiza o state do projeto para refletir as alterações na tela
        setState(oldState => {
            const { label } = oldState.project.projectConfigs;
            document.title = label === '' ? 'Code Easy' : label + ' - Code Easy';

            return {
                ...oldState,
                project
            }
        });
    }, []);

    const [state, setState] = useState<ICodeEditorContext>({
        project: ProjectsStorage.getProjectById(id),
        setProject: handleSetProject,
    });
    useEffect(() => {
        if (id === undefined) history.replace('/');

        setState(oldState => ({
            ...oldState,
            project: ProjectsStorage.getProjectById(id)
        }));
    }, [id, history]);

    return (
        <CodeEditorContext.Provider value={state}>
            {
                state.project.projectConfigs
                    ? children
                    : <CenterLoadingIndicator />
            }
        </CodeEditorContext.Provider>
    );
}

export const useEditorContext = () => {

    const { project, setProject } = useContext<ICodeEditorContext>(CodeEditorContext);

    const handleGetItemTreeEditing = useCallback((): ItemComponent | null => {
        let itemTree: ItemComponent | null = null;

        project.tabs.forEach(tab => {
            const resItemTree = tab.items.find(itemTree => itemTree.isEditing);
            if (resItemTree) {
                itemTree = resItemTree;
            }
        });

        return itemTree;
    }, [project.tabs]);

    const handleGetItemTreeById = useCallback((id: string, type?: ComponentType): ItemComponent | null => {
        if (type) {
            const tab = project.tabs.find(tab => tab.configs.type === type);
            if (!tab) return null;

            const itemTree = tab.items.find(itemTree => itemTree.id === id);
            if (!itemTree) return null;

            return itemTree;
        } else {
            let itemTree: ItemComponent | null = null;

            project.tabs.forEach(tab => {
                const resItemTree = tab.items.find(itemTree => itemTree.id === id);
                if (resItemTree) {
                    itemTree = resItemTree;
                }
            });

            return itemTree;
        }
    }, [project.tabs]);

    return {
        /**
         * @returns `ItemComponent` | `null` - Returns the tree element that is currently being edited or null
         */
        getItemTreeEditing: handleGetItemTreeEditing,
        /**
         * Return a item tree by there id and type
         * 
         * @param id Identifier of the item tree 
         * @param type Tab where the item is. Can be: `tabActions`, `tabDates` and `tabRoutes`.
         */
        getItemTreeById: handleGetItemTreeById,
        setProject,
        project,
    };
}
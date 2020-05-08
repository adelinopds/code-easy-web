import React, { Component } from 'react';

import './ResizeTemplate.css';
import { Storage } from '../../services/LocalStorage';

interface IRecipeProps {
    bottom: JSX.Element,
    top: JSX.Element,
    id: string,
}

export class TwoVerticalColumnsResizable extends Component<IRecipeProps> {

    state = { bottomHeight: 400 }

    componentDidMount() {
        this.setState({
            bottomHeight: Storage.getColumnsResizableSize(this.props.id),
        });
    }

    mouseMove = (event: any) => {
        this.setState({ bottomHeight: (window.innerHeight - event.pageY) - 20, });
    }

    mouseUp = () => {
        window.onmouseup = null;
        window.onmousemove = null;
        Storage.setColumnsResizableSize(this.props.id, this.state.bottomHeight);
    }

    mouseDown = () => {
        window.onmousemove = this.mouseMove;
        window.onmouseup = this.mouseUp;
    }

    render() {
        return (
            <div className="flex1 flex-column">
                {this.props.top}
                <div className="flex-column" style={{ height: this.state.bottomHeight, minHeight: '20%', maxHeight: '90%' }}>
                    <hr className='hr' />
                    <div className="grabber-col-right-resize-y" onMouseDown={this.mouseDown} />
                    {this.props.bottom}
                </div>
            </div>
        );
    }
}
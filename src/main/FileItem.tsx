import * as React from "react";
import classNames from "classnames";

interface FileItemProps {
    id: string;
    active: boolean;
    onClick: (e) => void;
}

export default class FileItem extends React.Component<FileItemProps, {}> {
    render() {
        return(
            <div
                className={classNames("file-item", {"active": this.props.active})}
                onClick={this.props.onClick}
                id={this.props.id}
            >
                {this.props.children}
            </div>
        );
    }
}
import React, { Component } from 'react';

class Article extends Component {
    render() {
        return (
            <article className="list-post">
                <a href={this.props.linksTo}>
                    <h2 className="title">{this.props.title}</h2>
                    <h3 className="sub-title"> {this.props.subTitle}</h3>

                    <p className="short-description">{this.props.shortDescription}</p>
                </a>
            </article>
        );
    }
}

export default Article
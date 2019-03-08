import React, { Component } from 'react';
import BlogListArticle from 'Components/Blog/List/Article';

class AtomicPalette extends Component {
    constructor(props) {
        super(props);

        let articles = this.getMockArticles();

        this.state = { articles };
    }

    getMockArticles() {
        //  TODO Move later
        return [
            {
                title: "Systems Thinking, Unlocked",
                subTitle: "Building an inclusive design language system",
                shortDescription: "A Case Study",
                linksTo: "#"
            },
            {
                title: "Prototyping for Hosts",
                subTitle: "How a tool for engineers became integral to the design process",
                shortDescription: "Behind the Scenes",
                linksTo: "#"
            },
            {
                title: "Co-hosting",
                subTitle: "Designing a service to support community collaboration",
                shortDescription: "Behind the Scenes",
                linksTo: "#"
            },
        ];
    }

    render() {
        return (
            <div>
                {this.state.articles.map((article, index) => {                    
                    return (
                        <div>
                            <BlogListArticle key={index} {...article} />
                            <hr />
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default AtomicPalette
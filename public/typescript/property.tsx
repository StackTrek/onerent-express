import { React, Component, KeyValuePair } from 'chen-react';

export interface PropertyState {}

export interface PropertyProps {
  details?: KeyValuePair<any>;
}

export class Property extends Component<PropertyProps, PropertyState> {

  public componentDidMount() {
    console.log(this.props.details['_id']);
  }

  public render() {
    return (
      <div key={this.props.details['_id']} id={`res-${this.props.details['_id']}`} className="result-item col-md-6">
        {this.props.details['images'] && this.props.details['images'].length ?
          <div className="image-carousel">
            <div className="like-button"></div>
            <div className="slide-pag">
              <a href="#" className="next"><i className="fa fa-chevron-right"></i></a>
              <a href="#" className="prev"><i className="fa fa-chevron-left"></i></a>
            </div>
            <div className="owl-carousel owl-theme">
              <div className="item">
                <img className="img-responsive" src="http://placehold.it/400x250"/>
              </div>
            </div>
          </div> :
          <div className="place-img"
               style={{backgroundImage: `url(https://maps.googleapis.com/maps/api/streetview?location=${this.props.details['location']['lat']},${this.props.details['location']['long']}&size=1280x720&fov=90&key=AIzaSyAp2FJJJNV6peSh8vHfXxb680UQZh7f33E)`}}></div>
        }
        <div className="item-description">
          <div className="soon pull-right">
            Coming Soon
          </div>
          <h5>
            {this.props.details['street']} · {this.props.details['state']}
          </h5>
          <h6>
            {this.props.details['bed']} bed, {this.props.details['bathRoom']} bath · {this.props.details['totalArea']} sqft · {this.props.details['credit']} credit
          </h6>
        </div>
      </div>
    );    
  }
}

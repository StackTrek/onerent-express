import { React, Component, bind, KeyValuePair } from 'chen-react';

export interface PropertyState {}

export interface PropertyProps {
  details?: KeyValuePair<any>;
}

export class Property extends Component<PropertyProps, PropertyState> {

  private elCarousel: HTMLDivElement;
  private jqElCarousel: JQuery;

  public componentDidMount() {
    if (this.elCarousel) {
      this.jqElCarousel = $(this.elCarousel);
      (this.jqElCarousel as any).owlCarousel({ items: 1, dots: false });
    }
  }

  @bind()
  public nextImage() {
    if (this.jqElCarousel) {
      this.jqElCarousel.trigger('next.owl.carousel');
    }
  }

  @bind()
  public prevImage() {
    if (this.jqElCarousel) {
      this.jqElCarousel.trigger('prev.owl.carousel');
    }
  }

  public render() {
    let rate = window['currency']['rate'];
    let symbol = window['currency']['symbol'];

    return (
      <div key={this.props.details['_id']} id={`res-${this.props.details['_id']}`} className="result-item col-md-6">
        {this.props.details['images'] && this.props.details['images'].length ?
          <div className="image-carousel">
            <div className="like-button"></div>
            <div className="slide-pag">
              <a href="javascript:void(0)" className="next" onClick={this.nextImage}><i className="fa fa-chevron-right"></i></a>
              <a href="javascript:void(0)" className="prev" onClick={this.prevImage}><i className="fa fa-chevron-left"></i></a>
            </div>
            <div className="owl-carousel owl-theme" ref={e => this.elCarousel = e}>
              {this.props.details['images'].map((img, index) =>
              <div key={index} className="item" style={{ backgroundImage: `url(${img})` }}></div>
              )}
            </div>
          </div> :
          <div className="image-carousel">
            <div className="like-button"></div>
            <div className="place-img"
                 style={{backgroundImage: `url(https://maps.googleapis.com/maps/api/streetview?location=${this.props.details['location']['lat']},${this.props.details['location']['long']}&size=1280x720&fov=90&key=AIzaSyAp2FJJJNV6peSh8vHfXxb680UQZh7f33E)`}}>
            </div>
          </div>
        }
        <div className="item-description">
          <div className="soon pull-right">
            {this.props.details['ready'] ? `${symbol}${(rate * this.props.details['rent'] as any).formatMoney(0)}/mo` : 'Coming Soon!'}
          </div>
          <h5>
            {this.props.details['street']} · {this.props.details['city']}
          </h5>
          <h6>
            {this.props.details['bed'] || '0'} bed, {this.props.details['bathRoom'] || '0'} bath &middot; {this.props.details['totalArea'] || '0'} sqft &middot; {this.props.details['credit'] || '0'} credit
          </h6>
        </div>
      </div>
    );
  }
}

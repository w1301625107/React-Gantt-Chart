import * as React from 'react'

export interface IDynamicRender {
  scrollTop: number;
  heightOfRenderAera: number;
  cellHeight: number;
  preload: number
}

// const preload = 1;

export class DynamicRender<S extends IDynamicRender> extends React.Component<S , any>{
  public static defaultProps={preload:1};

  constructor(props: S) {
    super(props)
  }


  public currentTopIndex = () => {
    const { scrollTop, cellHeight } = this.props
    return Math.ceil(scrollTop / cellHeight);
  }


  public getRangeAndTopSpace = () => {
    const { cellHeight, preload, heightOfRenderAera } = this.props;

    const currentIndex = this.currentTopIndex()

    if (heightOfRenderAera === 0 || cellHeight === 0) {
      return [0, 0]
    }

    if (preload === 0) {
      return [-Infinity, Infinity,0]
    }

    const end = currentIndex + Math.ceil(heightOfRenderAera / cellHeight) +
      preload;
    const start = currentIndex - preload > 0 ? currentIndex - preload! : 0;
    const topSpace = start * cellHeight
    return [start, end ,topSpace]
  }
}


export default DynamicRender
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

  public oldCurrentTopIndex = 0

  public currentTopIndex = () => {
    const { scrollTop, cellHeight } = this.props
    return Math.ceil(scrollTop / cellHeight);
  }

  public needReRender = () => {

    const  preload  = this.props.preload
    const val = this.currentTopIndex()
    const oldCurrentTopIndex = this.oldCurrentTopIndex

    const errorValue = 1 // 为误差值，
    if (val < oldCurrentTopIndex - (preload - errorValue) || val >
      oldCurrentTopIndex + (preload - errorValue)) {
      this.oldCurrentTopIndex = val;
    } 
  }

  public getRange = () => {
    this.needReRender()
    const { cellHeight, preload, heightOfRenderAera } = this.props;

    const currentIndex = this.currentTopIndex()

    if (heightOfRenderAera === 0 || cellHeight === 0) {
      return [0, 0]
    }

    if (preload === 0) {
      return [-Infinity, Infinity]
    }

    const end = currentIndex + Math.ceil(heightOfRenderAera / cellHeight) +
      preload;
    const start = currentIndex - preload > 0 ? currentIndex - preload! : 0;

    return [start, end]
  }

  public calTopSpace() {
    const oldCurrentTopIndex = this.oldCurrentTopIndex;
    const {
      cellHeight,
      preload
    } = this.props;
    const start =
    oldCurrentTopIndex - preload > 0 ? oldCurrentTopIndex - preload : 0;
    return start * cellHeight;
  }
}

// DynamicRender.defaultProps = {
//   preload: 1
// }

export default DynamicRender
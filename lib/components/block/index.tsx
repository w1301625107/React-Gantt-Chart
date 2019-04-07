import * as React from 'react'

import { DynamicRender, IDynamicRender } from '../dynamic-render'
import { isUndef, warn } from "../../utils/tool.js"

interface IBlock extends IDynamicRender {
  datas: any[];
  dataKey?: string;
  widthOfRenderAera: number;
  totalWidth: number;
  cellWidth: number;
  scrollLeft: number;
  endTimeOfRenderArea?: number;
  startTimeOfRenderArea?: number;
  getPositonOffset: (date: string) => number;
  getWidthAbout2Times: (time1: string, time2: string) => number;
  renderBlock: (data, getPositonOffset: (date: string) => number, getWidthAbout2Times: (time1: string, time2: string) => number, isInRenderingTimeRange: (time: string) => boolean, startTimeOfRenderArea: number, endTimeOfRenderArea: number) => JSX.Element;
}

class Block extends DynamicRender<IBlock>{

  public isInRenderingTimeRange = (time) => {
    if (this.props.heightOfRenderAera === 0) {
      return false;
    }

    const { startTimeOfRenderArea, endTimeOfRenderArea } = this.props;
    if (isUndef(startTimeOfRenderArea) || isUndef(endTimeOfRenderArea)) {
      return false;
    }

    const timeToMs = new Date(time).getTime();
    if (startTimeOfRenderArea! <= timeToMs && timeToMs <= endTimeOfRenderArea!) {
      return true;
    }
    return false;
  }

  public render() {
    const { cellWidth, cellHeight, datas, dataKey, totalWidth, renderBlock, getWidthAbout2Times, getPositonOffset, startTimeOfRenderArea, endTimeOfRenderArea } = this.props
    const blockHeight = datas.length * cellHeight;
    const blockStyle = {
      backgroundSize: `${cellWidth}px ${cellHeight}px`,
      height: `${cellHeight}px`
    };
    const showDatas = datas.slice(...this.getRange())

    return (
      <div className="gantt-blocks"
        style={{ height: blockHeight, width: totalWidth }}>
        <div className="gantt-block gantt-block-top-space"
          style={{ height: this.calTopSpace() + 'px' }}>
        </div>
        {
          showDatas.map((data, index) => {
            return (
              <div className="gantt-block"
                style={blockStyle}
                key={dataKey ? data[dataKey] : index}>
                {
                  renderBlock ? renderBlock(data, getPositonOffset, getWidthAbout2Times, this.isInRenderingTimeRange, startTimeOfRenderArea!, endTimeOfRenderArea!) : 'need renderBlock'
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Block 
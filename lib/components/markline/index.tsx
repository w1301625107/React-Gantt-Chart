import * as React from 'react'
import dayjs from 'dayjs'
import { ColorProperty } from 'csstype';

export interface IMarkLine {
  bgc: ColorProperty;
  markLineTime: string;
  getPositonOffset: (date: string) => number;
}

class Markline<P extends IMarkLine>  extends React.Component<P , any>{

  public render() {
    const { bgc, getPositonOffset, markLineTime } = this.props
    return (
      <div
        className="gantt-markline"
        style={{ backgroundColor: bgc,'left': getPositonOffset(markLineTime) + 'px' }}>
        <div className="gantt-markline-label"
          style={{ backgroundColor: bgc }}>
          {dayjs(markLineTime).format("HH:mm:ss")}</div>
      </div>
    )
  }

}

export default Markline
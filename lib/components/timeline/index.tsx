import * as React from 'react';

import dayjs from 'dayjs'
import { getBeginTimeOfTimeLine } from "../../utils/timeLineUtils.js";

const START_DAY = Symbol();
const MIDDLE_DAY = Symbol();
const END_DAY = Symbol();

interface ITimelineProps {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  cellWidth: number,
  titleHeight: number,
  scale: number,
  style?: React.CSSProperties
}

function isSameDay(one: dayjs.Dayjs, two: dayjs.Dayjs) {
  return one.isSame(two, "day");
}

/**
 * 获取时间刻度数组
 *
 * @param {dayjs.Dayjs} date
 * @returns {[string]} 该data中所有需要渲染的数据
 */
function getTimeScales(date: dayjs.Dayjs,start: dayjs.Dayjs, end: dayjs.Dayjs, scale: number) {
  // let { start, end } = this;

  if (isSameDay(date, start)) {
    return generateTimeScale(START_DAY, start, end, scale);
  } else if (isSameDay(date, end)) {
    return generateTimeScale(END_DAY, start, end, scale);
  } else {
    return generateTimeScale(MIDDLE_DAY, start, end, scale);
  }
}

/**
 * 生成时间刻度数组
 *
 * @param {Symbol} type
 * @returns {[string]} 该data中所有需要渲染的数据
 */
function generateTimeScale(type: symbol, start: dayjs.Dayjs, end: dayjs.Dayjs, scale: number) {
  const  totalblock: string[] = [];
  // let { start, end, scale } = this;
  let a;
  let b;
  switch (type) {
    case START_DAY: // 和start同一天
      a = getBeginTimeOfTimeLine(start, scale);
      // start和end同一天特殊处理
      if (isSameDay(start, end)) {
        b = end;
      } else {
        b = start.endOf("day");
      }
      break;
    case END_DAY: // 和end 同一天
      a = end.startOf("day");
      b = end;
      break;
    case MIDDLE_DAY: // start和end中间的天
      a = start.startOf("day");
      b = start.endOf("day");
      break;
    default:
      throw new TypeError("错误的计算类型");
  }
  while (!a.isAfter(b)) {
    if (scale >= 60) {
      totalblock.push(a.format("HH"));
    } else {
      totalblock.push(a.format("HH:mm"));
    }
    a = a.add(scale, "minute");
  }

  return totalblock;
}

/**
 * 天列表
 * @returns {[dayjs.Dayjs]} 该data中所有需要渲染的数据
 */
function getDays(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const temp: dayjs.Dayjs[] = [];
  let tempS = start.clone()

  for (; !isSameDay(tempS, end); tempS = tempS.add(1, "day")) {
    temp.push(tempS);
  }
  temp.push(tempS);

  return temp;
}

class Timeline extends React.PureComponent<ITimelineProps> {


  public render() {
    const { cellWidth, titleHeight,start,end,scale } = this.props
    const cellWidthStyle = {
      width: cellWidth
    };

    const heightStyle = {
      height: titleHeight / 2,
      lineHeight: titleHeight/2+'px'
    };
    return (
      <div className="gantt-timeline"
        style={{ marginLeft: -cellWidth / 2 }} >
        {
          getDays(start,end).map((day,index)=>{
            const scales = getTimeScales(day,start,end,scale)
            return (
              <div className="gantt-timeline-block" key={index} style={{width:scales.length*cellWidth}}>
                <div className="gantt-timeline-day "
                  style={heightStyle}>{day.format("MM/DD")}</div>
                <div className="gantt-timeline-scale "
                     style={heightStyle}>
                  {
                    scales.map((hour,hkey)=>{
                      return <div key={hkey} style={cellWidthStyle}>{hour}</div>
                    })
                  }
                </div>
                
              </div>
            )
          })
        }
      </div>
    )
  }
}


export default Timeline
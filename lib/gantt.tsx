import * as React from 'react';
import './gantt.css';
import dayjs from 'dayjs';
import memoize from "memoize-one";
import ResizeObserver from "resize-observer-polyfill";
import throttle from "./utils/throttle.js";
import { isDef, warn } from "./utils/tool.js";
import {
  scaleList,
  getBeginTimeOfTimeLine,
  calcScalesAbout2Times
} from "./utils/timeLineUtils.js"
import {
  getPositonOffset as _getPositonOffset,
  getWidthAbout2Times as _getWidthAbout2Times
} from "./utils/gtUtils.js";

import Timeline from './components/timeline'
import Block from './components/block'
import Leftbar from './components/leftbar'
import CurrentTime from './components/markline/current-time'
import Markline from './components/markline/index'

interface ITimeline {
  time: string, color: string
}

interface IGanttProps {
  startTime: string;
  endTime: string;
  scale: number;
  cellWidth: number;
  cellHeight: number;
  titleHeight: number;
  titleWidth: number;
  showCurrentTime: boolean
  hideXScrollBar: boolean;
  hideYScrollBar: boolean;
  hideHeader: boolean;
  datas: any[];
  dataKey?: string;
  timelines: ITimeline[],
  scrollToTime?: string;
  renderLeftBar: (data) => JSX.Element;
  renderBlock: (data, getPositonOffset: (date: string) => number, getWidthAbout2Times: (time1: string, time2: string) => number, isInRenderingTimeRange: (time: string) => boolean, startTimeOfRenderArea: number, endTimeOfRenderArea: number) => JSX.Element;
  renderHeader?: () => JSX.Element
}

interface IGanttState {
  heightOfRenderAera: number,
  widthOfRenderAera: number,
  scrollTop: number,
  scrollLeft: number,
  startTimeOfRenderArea: number | undefined,
  endTimeOfRenderArea: number | undefined
}

const SCROLL_BAR_WIDTH = 17;
const DEFAUT_HEADER = `welcome R-gantt-chart`;

class App extends React.Component<IGanttProps, IGanttState> {

  public static defaultProps;

  constructor(props: IGanttProps) {
    super(props)
    this.state = {
      heightOfRenderAera: 0,
      widthOfRenderAera: 0,
      scrollTop: 0,
      scrollLeft: 0,
      startTimeOfRenderArea: undefined,
      endTimeOfRenderArea: undefined
    }
  }
  private headerTimelineRef = React.createRef<HTMLDivElement>()
  private marklineAreaRef = React.createRef<HTMLDivElement>()
  private leftbarWrapperRef = React.createRef<HTMLDivElement>()
  private blocksWrapperRef = React.createRef<HTMLDivElement>()
  private scrollYBarRef = React.createRef<HTMLDivElement>()
  private scrollXBarRef = React.createRef<HTMLDivElement>()

  public start = memoize((startTime: string): dayjs.Dayjs => dayjs(startTime))

  public end = memoize((startTime: string, endTime: string, widthOfRenderAera: number, scale: number, cellWidth: number): dayjs.Dayjs => {
    const start = this.start(this.props.startTime);
    let end = dayjs(endTime);
    const totalWidth = calcScalesAbout2Times(start, end, scale) * cellWidth;
    if (start.isAfter(end) || totalWidth <= widthOfRenderAera) {
      end = start.add((widthOfRenderAera / cellWidth) * scale, "minute");
    }
    return end;
  })

  public calcScalesAbout2Times = memoize(calcScalesAbout2Times)

  public getBeginTimeOfTimeLine = memoize(getBeginTimeOfTimeLine)

  public getStartAndEnd = () => {
    const { startTime, endTime, scale, cellWidth } = this.props
    const { widthOfRenderAera } = this.state
    const start = this.start(startTime)
    const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
    return {
      start,
      end
    }
  }

  public scrollToTime = (newV) => {
    const { start, end } = this.getStartAndEnd();
    const time = dayjs(newV);
    if (!(time.isAfter(start) && time.isBefore(end))) {
      warn(`当前滚动至${newV}不在${start}和${end}的范围之内`);
      return;
    }

    const { cellWidth, scale } = this.props;
    const beginTimeOfTimeLine = this.getBeginTimeOfTimeLine(start, scale)
    const beginTimeOfTimeLineToString = beginTimeOfTimeLine.toString()

    const getPositonOffset = (date: string) => {
      return _getPositonOffset(date, beginTimeOfTimeLineToString, {
        scale,
        cellWidth
      });
    }
    const offset = getPositonOffset(newV);
    this.syncScrollX(
      {
        target: {
          scrollLeft: offset
        }
      },
      true
    )
  }

  public scrollToPosition = (position: { x?: number, y?: number }) => {
    if (!position) {
      return;
    }
    const x = Number.isNaN(position.x!) ? undefined : position.x;
    const y = Number.isNaN(position.y!) ? undefined : position.y;
    const { scrollLeft, scrollTop } = this.state
    if (isDef(x) && x !== scrollLeft) {
      this.syncScrollX({ target: { scrollLeft: x } }, true);
    }
    if (isDef(y) && y !== scrollTop) {
      this.syncScrollY({ target: { scrollTop: y } }, true);
    }
  }

  public componentDidMount = () => {
    const observeContainer = throttle(entries => {
      entries.forEach(entry => {
        const cr = entry.contentRect;
        this.setState({
          heightOfRenderAera: cr.height,
          widthOfRenderAera: cr.width
        })
      });
    });
    const observer = new ResizeObserver(observeContainer);
    observer.observe(this.blocksWrapperRef.current as Element);
  }



  public wheelHandle = (event) => {
    const { deltaX, deltaY } = event;
    const {
      scrollTop,
      scrollLeft,
      widthOfRenderAera,
      heightOfRenderAera
    } = this.state;

    const { startTime, endTime, scale, cellWidth, datas, cellHeight } = this.props

    const start = this.start(startTime)
    const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
    const totalScale = this.calcScalesAbout2Times(start, end, scale)
    const totalWidth = totalScale * cellWidth
    const totalHeight = datas.length * cellHeight
    const avialableScrollLeft = totalWidth - widthOfRenderAera - 1
    const avialableScrollTop = totalHeight - heightOfRenderAera - 1

    if (deltaY !== 0) {
      if (
        scrollTop + deltaY >= avialableScrollTop &&
        scrollTop !== avialableScrollTop
      ) {
        this.syncScrollY(
          { target: { scrollTop: avialableScrollTop } },
          true
        );
      } else if (
        scrollTop + deltaY < 0 &&
        scrollTop !== 0 /*滚动为0限制*/
      ) {
        this.syncScrollY({ target: { scrollTop: 0 } }, true);
      } else {
        this.syncScrollY(
          { target: { scrollTop: scrollTop + deltaY } },
          true
        );
      }
    }
    if (deltaX !== 0) {
      if (
        scrollLeft + deltaX >= avialableScrollLeft &&
        scrollLeft !== avialableScrollLeft
      ) {
        this.syncScrollX(
          { target: { scrollLeft: avialableScrollLeft } },
          true
        );
      } else if (
        scrollLeft + deltaX < 0 &&
        scrollLeft !== 0 /*滚动为0限制*/
      ) {
        this.syncScrollX({ target: { scrollLeft: 0 } }, true);
      } else {
        this.syncScrollX(
          { target: { scrollLeft: scrollLeft + deltaX } },
          true
        );
      }
    }

  }
  // 同步fixleft和block的滚动
  public syncScrollY = (event, fake = false) => {
    const { leftbarWrapperRef, blocksWrapperRef, scrollYBarRef } = this;
    const topValue = event.target.scrollTop;
    if (fake) {
      // 会触发一次真的滚动事件event, 后面的代码会在第二个事件中执行
      scrollYBarRef.current!.scrollTop = topValue;
      return;
    }
    leftbarWrapperRef.current!.scrollTop = topValue;
    blocksWrapperRef.current!.scrollTop = topValue;
    this.setState({
      scrollTop: topValue
    })
    // this.scrollTop = topValue;
    // this.$emit("scrollTop", topValue);
  }

  public syncScrollX = (event, fake = false) => {
    const {
      blocksWrapperRef,
      headerTimelineRef,
      marklineAreaRef,
      scrollXBarRef
    } = this;
    const leftValue = event.target.scrollLeft;
    if (fake) {
      // 会触发一次真的滚动事件event, 后面的代码会在第二个事件中执行
      scrollXBarRef.current!.scrollLeft = leftValue;
      return;
    }
    blocksWrapperRef.current!.scrollLeft = leftValue;
    headerTimelineRef.current!.scrollLeft = leftValue;
    marklineAreaRef.current!.style.left = "-" + leftValue + "px";
    this.setState({
      scrollLeft: leftValue
    })
    // this.scrollLeft = leftValue;
    // this.$emit("scrollLeft", leftValue);
  }


  public render() {
    const { startTime, endTime, scale, cellHeight, cellWidth, titleHeight, titleWidth, datas, showCurrentTime, hideYScrollBar, hideXScrollBar, hideHeader, dataKey, renderLeftBar, renderBlock, renderHeader, timelines } = this.props
    const { widthOfRenderAera, heightOfRenderAera, scrollLeft, scrollTop } = this.state
    const start = this.start(startTime)
    const end = this.end(startTime, endTime, widthOfRenderAera, scale, cellWidth)
    const totalScale = this.calcScalesAbout2Times(start, end, scale)
    const totalWidth = totalScale * cellWidth
    const totalHeight = datas.length * cellHeight
    // const totalHeight = 10000;
    const scrollYBarWidth = hideYScrollBar ? 0 : SCROLL_BAR_WIDTH
    const scrollXBarHeight = hideXScrollBar ? 0 : SCROLL_BAR_WIDTH
    const actualHeaderHeight = hideHeader ? 0 : titleHeight;
    const beginTimeOfTimeLine = this.getBeginTimeOfTimeLine(start, scale)
    const beginTimeOfTimeLineToString = beginTimeOfTimeLine.toString()

    const startTimeOfRenderArea = beginTimeOfTimeLine
      .add((scrollLeft / cellWidth) * scale, "minute")
      .toDate()
      .getTime();

    const endTimeOfRenderArea = beginTimeOfTimeLine
      .add(((scrollLeft + widthOfRenderAera) / cellWidth) * scale, "minute")
      .toDate()
      .getTime()

    const getPositonOffset = (date: string) => {
      return _getPositonOffset(date, beginTimeOfTimeLineToString, {
        scale,
        cellWidth
      });
    }

    const getWidthAbout2Times = (time1: string, time2: string) => {
      return _getWidthAbout2Times(time1, time2, {
        scale,
        cellWidth
      });
    }

    return (
      <div className="gantt-chart"
        onWheel={this.wheelHandle}>
        <div className="gantt-container"
          style={{
            height: `calc(100% - ${scrollXBarHeight}px)`, width: `calc(100% - ${scrollYBarWidth}px)`
          }}>
          <div
            className="gantt-header"
            style={{ display: hideHeader ? 'none' : 'flex', width: `calc(100% + ${scrollYBarWidth}px)` }}
          >
            <div className="gantt-header-title"
              style={{ lineHeight: titleHeight + 'px', height: titleHeight, width: titleWidth }}
            >{renderHeader ? renderHeader() : DEFAUT_HEADER}
            </div>
            <div ref={this.headerTimelineRef}
              className="gantt-header-timeline"
              style={{ width: `calc(100% - ${titleWidth}px)` }}>
              <div className="gantt-timeline-wrapper"
                style={{ width: totalWidth + scrollYBarWidth }}
              >
                <Timeline start={start}
                  end={end}
                  scale={scale}
                  cellWidth={cellWidth}
                  titleHeight={titleHeight} />
              </div>
            </div>
          </div>

          <div className="gantt-body"
            style={{ height: `calc(100% - ${actualHeaderHeight}px)` }}
          >
            <div className="gantt-table">
              <div ref={this.marklineAreaRef}
                className="gantt-markline-area"
                style={{ marginLeft: titleWidth }}>
                {
                  showCurrentTime && <CurrentTime getPositonOffset={getPositonOffset} />
                }
                {
                  timelines!.map((timeline, index) => {
                    return <Markline key={index}
                      getPositonOffset={getPositonOffset}
                      bgc={timeline.color}
                      markLineTime={timeline.time} />
                  })
                }
              </div>
              <div ref={this.leftbarWrapperRef}
                className="gantt-leftbar-wrapper"
                style={{ 'width': titleWidth, height: `calc(100% + ${scrollXBarHeight}px)` }}
              >
                <Leftbar
                  dataKey={dataKey}
                  cellHeight={cellHeight}
                  datas={datas}
                  heightOfRenderAera={heightOfRenderAera}
                  scrollTop={scrollTop}
                  visualHeight={totalHeight + scrollXBarHeight}
                  renderLeftBar={renderLeftBar}
                />
              </div>
              <div ref={this.blocksWrapperRef}
                style={{ width: `calc(100% - ${titleWidth}px)` }}
                className="gantt-blocks-wrapper">
                <Block
                  dataKey={dataKey}
                  cellHeight={cellHeight}
                  cellWidth={cellWidth}
                  datas={datas}
                  widthOfRenderAera={widthOfRenderAera}
                  heightOfRenderAera={heightOfRenderAera}
                  scrollLeft={scrollLeft}
                  scrollTop={scrollTop}
                  endTimeOfRenderArea={endTimeOfRenderArea}
                  startTimeOfRenderArea={startTimeOfRenderArea}
                  getPositonOffset={getPositonOffset}
                  getWidthAbout2Times={getWidthAbout2Times}
                  renderBlock={renderBlock}
                  totalWidth={totalWidth} />
              </div>
            </div>
          </div>
        </div>

        <div ref={this.scrollYBarRef}
          className="gantt-scroll-y"
          style={{
            width: `${scrollYBarWidth}px`,
            height: `calc(100% - ${actualHeaderHeight}px`, marginTop: `${actualHeaderHeight}px`
          }}
          onScroll={this.syncScrollY}
        >
          <div style={{ height: totalHeight + 'px' }} ></div>
        </div>

        <div ref={this.scrollXBarRef}
          className="gantt-scroll-x"
          style={{
            height: `${scrollXBarHeight}px`,
            width: `calc(100% - ${titleWidth}px )`, marginLeft: titleWidth + 'px'
          }}
          onScroll={this.syncScrollX}
        >
          <div style={{ width: totalWidth + 'px' }} ></div>
        </div>

      </div>
    );
  }
}

App.defaultProps = {
  startTime: dayjs().toString(),
  endTime: dayjs().toString(),
  scale: 60,
  cellWidth: 50,
  cellHeight: 40,
  titleHeight: 40,
  titleWidth: 200,
  showCurrentTime: false,
  hideHeader: false,
  hideXScrollBar: false,
  hideYScrollBar: false,
  datas: [],
  timelines: []
}

export default App;
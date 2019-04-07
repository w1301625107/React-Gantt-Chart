import * as React from 'react'
import Markline from './index';
import { ColorProperty } from 'csstype';
import dayjs from 'dayjs';

interface ICurrentTime {
  bgc?: ColorProperty;
  getPositonOffset: (date: string) => number,
}

interface ICurrentTimeState {
  currentTime: dayjs.Dayjs
}


class CurrentTime extends React.Component<ICurrentTime, ICurrentTimeState>{

  constructor(props: ICurrentTime) {
    super(props)
    this.state = {
      currentTime: dayjs()
    }
  }

  public timerID: NodeJS.Timeout;

  public componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState({
        currentTime: dayjs()
      })
    }, 1000);
  }

  public componentWillUnmount() {
    clearInterval(this.timerID);
  }

  public render() {
    const { bgc, getPositonOffset, } = this.props
    const time = this.state.currentTime.toString()
    return (
      <Markline bgc={bgc||'rgba(255,0,0,.4)'} getPositonOffset={getPositonOffset}
        markLineTime={time} />
    )
  }

}

export default CurrentTime

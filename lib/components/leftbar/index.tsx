import * as React from 'react'

import { DynamicRender, IDynamicRender } from '../dynamic-render'

export type renderLeftBarFunc =  (data) => JSX.Element
 

interface ILeftbar extends IDynamicRender {
  datas: any[];
  dataKey?: string;
  visualHeight:number,
  renderLeftBar?:renderLeftBarFunc
}

class Leftbar extends DynamicRender<ILeftbar>{

  public render() {
    const { cellHeight, datas, dataKey,visualHeight,renderLeftBar } = this.props
    const [startNum,endNum,topSpace] = this.getRangeAndTopSpace()
    const showDatas = datas.slice(startNum,endNum)

    return (
      <div className="gantt-leftbar" style={
        {height:visualHeight}
      }>
        <div className="gantt-leftbar-item gantt-block-top-space"
          style={{ height: topSpace + 'px' }}>
        </div>
        {
          showDatas.map((data, index) => {
            return (
              <div className="gantt-leftbar-item"
                style={{ height: cellHeight }}
                key={dataKey ? data[dataKey] : index}
              >
                {
                  renderLeftBar? renderLeftBar(data):<div className="gantt-leftbar-defalutItem">need slot</div>
                }
                
              </div>
            )
          })
        }

      </div>
    )
  }
}

export default Leftbar
import * as React from 'react'

import { DynamicRender, IDynamicRender } from '../dynamic-render'


interface ILeftbar extends IDynamicRender {
  datas: any[];
  dataKey?: string;
  visualHeight:number,
  renderLeftBar?:(data)=>JSX.Element
}

class Leftbar extends DynamicRender<ILeftbar>{

  public render() {
    const { cellHeight, datas, dataKey,visualHeight,renderLeftBar } = this.props
    const showDatas = datas.slice(...this.getRange())

    return (
      <div className="gantt-leftbar" style={
        {height:visualHeight}
      }>
        <div className="gantt-leftbar-item gantt-block-top-space"
          style={{ height: this.calTopSpace() + 'px' }}>
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
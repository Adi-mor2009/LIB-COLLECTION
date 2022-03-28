import React from 'react'
import { Progress, Segment } from 'semantic-ui-react'

function ProgressComponent({ percentProgress, success, warning, error }) {

    const ProgressExampleInverted = () => (
        <Segment inverted>
            <Progress percent={percentProgress} inverted progress>
                Uploading Files
            </Progress>
            {success && <Progress percent={100} inverted progress success>
                success
            </Progress>}
            {warning && <Progress percent={100} inverted progress warning>
                warning
            </Progress>}
            {error && <Progress percent={100} inverted progress error>
                error
            </Progress>}
        </Segment>
    )

    return (
       <div>
           {ProgressExampleInverted}
       </div>
    );
}

export default ProgressComponent;
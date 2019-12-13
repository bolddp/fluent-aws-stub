import * as sinon from 'sinon';

export class FluentAwsStub {
  constructor() {
    // Build stub hierarchy that matches the FluentAws API hierarchy
    this._buildStubs({
      autoScaling: { group: {} },
      dynamoDb: { table: {} },
      ec2: { instances: {} },
      ecs: { cluster: { services: {}, tasks: {} } },
      route53: { healthCheck: {}, hostedZone: { recordSets: {} } },
      s3: { bucket: { object: {} } }
    });
  }

  _buildStubs(scaffolding: any) {
    const buildStub = (target: any, source: any): sinon.SinonStub<any[], any> => {
      for (const key of Object.keys(source)) {
        target[key] = sinon.stub().returns(buildStub({}, source[key]));
      }
      return target;
    }
    buildStub(this, scaffolding);
  }

  stub(path: string, instance?: sinon.SinonStub<any[], any>): sinon.SinonStub<any[], any> {
    const segments = path.split('.').filter(x => x);
    const lastSegment = segments.splice(segments.length - 1, 1)[0];
    let currentNode: any = this;
    let previousNode: any = this;
    for (const segment of segments) {
      if (!currentNode[segment]) {
        currentNode[segment] = () => sinon.stub().returns(previousNode);
      } else {
        let resetInstance = currentNode[segment];
        currentNode = currentNode[segment]();
        // Clear the call count to the stub since we're setting up
        if (resetInstance.resetHistory) {
          resetInstance.resetHistory();
        }
      }
      previousNode = currentNode;
    }
    if (instance) {
      currentNode[lastSegment] = instance;
    }
    return currentNode[lastSegment];
  }
}

import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as LeaphyCloudCompile from '../lib/leaphy-cloud-compile-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new LeaphyCloudCompile.LeaphyCloudCompileStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

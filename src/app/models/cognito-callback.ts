import { ChallengeParameters } from './challenge-parameters';

export interface CognitoCallback {
  cognitoCallback(message: string, result: {}): void;

  handleMFAStep?(
    challengeName: string,
    challengeParameters: ChallengeParameters,
    callback: (confirmationCode: string) => {}
  ): void;
}

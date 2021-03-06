// @flow
import React from 'react';
import { Animated, Text } from 'react-native';

import { combineStyles, type StyleType } from '../../styles';

import AbstractCircularLabel, {
    type Props as AbstractProps
} from './AbstractCircularLabel';
import styles from './styles';

/**
 * Const for status string 'in progress'.
 */
const STATUS_IN_PROGRESS = 'in_progress';

/**
 * Const for status string 'off'.
 */
const STATUS_OFF = 'off';

type Props = AbstractProps & {

    /**
     * Status of the label. This prop adds some additional styles based on its
     * value. E.g. if status = off, it will render the label symbolising that
     * the thing it displays (e.g. recording) is off.
     */
    status: ('in_progress' | 'off' | 'on'),

    /**
     * Style of the label.
     */
    style?: ?StyleType
};

type State = {

    /**
     * An animation object handling the opacity changes of the in progress
     * label.
     */
    pulseAnimation: Object
}

/**
 * Renders a circular indicator to be used for status icons, such as recording
 * on, audio-only conference, video quality and similar.
 */
export default class CircularLabel extends AbstractCircularLabel<Props, State> {
    /**
     * A reference to the started animation of this label.
     */
    animationReference: Object;

    /**
     * Instantiates a new instance of {@code CircularLabel}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            pulseAnimation: new Animated.Value(0)
        };

        this._maybeToggleAnimation({}, props);
    }

    /**
     * Implements {@code Component#componentWillReceiveProps}.
     *
     * @inheritdoc
     */
    componentWillReceiveProps(newProps: Props) {
        this._maybeToggleAnimation(this.props, newProps);
    }

    /**
     * Implements React {@link Component}'s render.
     *
     * @inheritdoc
     */
    render() {
        const { status, label, style } = this.props;

        let extraStyle = null;

        switch (status) {
        case STATUS_IN_PROGRESS:
            extraStyle = {
                opacity: this.state.pulseAnimation
            };
            break;
        case STATUS_OFF:
            extraStyle = styles.labelOff;
            break;
        }

        return (
            <Animated.View
                style = { [
                    combineStyles(styles.indicatorContainer, style),
                    extraStyle
                ] }>
                <Text style = { styles.indicatorText }>
                    { label }
                </Text>
            </Animated.View>
        );
    }

    /**
     * Checks if the animation has to be started or stopped and acts
     * accordingly.
     *
     * @param {Props} oldProps - The previous values of the Props.
     * @param {Props} newProps - The new values of the Props.
     * @returns {void}
     */
    _maybeToggleAnimation(oldProps, newProps) {
        const { status: oldStatus } = oldProps;
        const { status: newStatus } = newProps;
        const { pulseAnimation } = this.state;

        if (newStatus === STATUS_IN_PROGRESS
                && oldStatus !== STATUS_IN_PROGRESS) {
            // Animation must be started
            this.animationReference = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnimation, {
                    delay: 500,
                    toValue: 1,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnimation, {
                    toValue: 0.3,
                    useNativeDriver: true
                })
            ]));

            this.animationReference.start();
        } else if (this.animationReference
                && newStatus !== STATUS_IN_PROGRESS
                && oldStatus === STATUS_IN_PROGRESS) {
            // Animation must be stopped
            this.animationReference.stop();
        }
    }
}

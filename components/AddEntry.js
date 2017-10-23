import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { getMetricMetaInfo, timeToString, getDeilyRememberValue } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import UdaciSlider from './UdaciSlider';
import UdaciSteppers from './UdaciSteppers';
import DateHeader from './DateHeader';
import TextButton from './TextButton';
import { removeEntry, submitEntry } from '../utils/api';
import { connect } from 'react-redux';
import { addEntry } from '../actions';

function SubmitBtn({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text>SUBMIT</Text>
        </TouchableOpacity>
    )
}

class AddEntry extends Component {
    state = {
        run: 0,
        bike: 5,
        swim: 0,
        sleep: 0,
        eat: 10
    }
    
    increment = (metric) => {
        const { max, step } = getMetricMetaInfo(metric);

        this.setState((state) => {
            const count = state[metric] + step;

            return {
                ...state,
                [metric]: count > max ? max : count
            }
        })
    }

    decrement = (metric) => {
        this.setState((state) => {
            const count = state[metric] - getMetricMetaInfo(metric).step;

            return {
                ...state,
                [metric]: count < 0 ? 0 : count
            }
        })
    }

    slider = (metric, value) => {
        this.setState(() => ({
            [metric]: value
        }))
    }

    submit = () => {
        const key = timeToString();
        const entry = this.state;

        this.props.dispatch(addEntry({
            [key]: entry
        }));

        this.setState(() => ({
            run: 0,
            bike: 0,
            swim: 0,
            sleep: 0,
            eat: 0
        }))

        submitEntry({ key, entry });
    }

    reset = () => {
        const key = timeToString();
        this.props.dispatch(addEntry({
            [key]: getDeilyRememberValue()
        }));
        removeEntry(key);
    }

    render() {
        const metaInfo = getMetricMetaInfo();

        //this.props.alreadyLogged
        if(true) {
            return (
                <View>
                    <Ionicons
                        name="ios-happy-outline"
                        size={100}
                    />
                    <Text>You alread logged your information for today</Text>
                    <TextButton onPress={this.reset}>
                        Reset
                    </TextButton>
                </View>
            )
        }

        return (
            <View>
                <DateHeader date={(new Date()).toLocaleDateString()}/>
                <Text>{JSON.stringify(this.state)}</Text>
               {Object.keys(metaInfo).map((key) => {
                    const { getIcon, type, ...rest} = metaInfo[key]
                    const value = this.state[key]

                    return (
                        <View key={key}>
                            {getIcon()}
                            {type === 'slider'
                                ? <UdaciSlider 
                                    value={value}
                                    onChange={(value) => this.setState({ [key]: value })}
                                    {...rest}
                                />
                                : <UdaciSteppers
                                    value={value}
                                    onIncrement={() => this.increment(key)}
                                    onDecrement={() => this.decrement(key)}
                                    {...rest}
                                />
                            }
                        </View>
                    )
               })}
               <SubmitBtn onPress={this.submit}/>
            </View>
        );
    }
}

function mapStateToProps(state) {
    const key = timeToString();

    return {
        alreadyLogged: state[key] && state[key].today === undefined
    }
}

export default connect(mapStateToProps)(AddEntry)
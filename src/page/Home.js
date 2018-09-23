import React, { Component } from 'react';
import { Text, View, StatusBar, Image, FlatList} from 'react-native';
import { DataList, HeaderButton, CommonPage, TitleBar, WordList, IconBox } from '../components';
import Realm from 'realm';

class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            mainTableData: [],
            deleteList: []           
        };
        this.selectHandler.bind(this);        
    } 

    componentWillMount(){        
        this.fetchData();
    }
    
    fetchData = () => {
        Realm.open(databaseOptions).then(realm => {
            let getData = realm.objects('main_table').sorted('title');
            
            getData.map(data => {
                this.setState({ mainTableData: [...this.state.mainTableData, {
                    id_main: data.id_main,
                    title: data.title,
                    category: data.category,
                    status: data.status,
                    checkBoxStatus: false
                }]})
            })                    
        });    
    }
    
    selectHandler = id_main => {
        let tempData = this.state.mainTableData;
        let tempDelete = this.state.deleteList;

        tempData.map(data => {
            if (data.id_main == id_main){
                data.checkBoxStatus = !data.checkBoxStatus
                
                if (data.checkBoxStatus == true){
                    tempDelete = [...tempDelete, id_main];
                } else {
                    let dataFilter = [];
                    dataFilter = tempDelete.filter(dataDeselect => {
                        return dataDeselect !== id_main;
                    });

                    tempDelete = dataFilter;
                }
            }

            this.setState({ 
                mainTableData: tempData, 
                deleteList: tempDelete
            });
        });
    }

    deleteListHandler = () => {
        Realm.open(databaseOptions).then(realm => {
            realm.write(() => {
                this.state.deleteList.map(dataDelete => {
                    let selectObjectMain = realm.objects('main_table').filtered('id_main = $0', dataDelete);
                    let selectObjectList = realm.objects('list_table').filtered('id_main = $0', dataDelete)
    
                    realm.delete(selectObjectMain);
                    realm.delete(selectObjectList);
                })
            })
            this.state.deleteList.map(stateDelete => {
                this.setState(prevState => {
                    return {
                        mainTableData: prevState.mainTableData.filter(param => {
                            return param.id_main !== stateDelete
                        }),
                        deleteList: []
                    }
                })
            })
        });   
    }

    componentDidMount() {
        this.props.navigation.setParams({ deleteHandler: this.deleteListHandler });
    }

    static navigationOptions = ({ navigation }) => {        
        const { navigate } = navigation;

        return{
            headerRight: (
                <View style={{ flexDirection: 'row' }}>
                    <HeaderButton onPress={navigation.getParam('deleteHandler')}>
                        <Image 
                            source={require('../img/delete.png')} 
                            style={{ width: 31, height: 31, tintColor: '#f8fcf6' }}                                             
                        />
                    </HeaderButton>
                    <HeaderButton onPress={() => navigate('additems')}>
                        <Image 
                            source={require('../img/add.png')} 
                            style={{ width: 31, height: 31, tintColor: '#f8fcf6' }}                                             
                        />
                    </HeaderButton>
                </View>
            ),   
        }        
    }        

    render(){        
        const { styContent, styScroll, styTopTitle } = styles;

        return(                        
            <View style={ styContent }>
                <StatusBar backgroundColor='#317256' />
                <CommonPage>
                    {/* <TitleBar>
                        <Text style={ styTopTitle }>My List</Text>
                        <WordList>
                            <IconBox>
                                <Image source={require('../img/check.png')} 
                                    style={{
                                        height: 19,
                                        width: 19,                                
                                        tintColor: '#52bf90',                                
                                    }}                            
                                />
                            </IconBox>
                        </WordList>
                    </TitleBar>                   */}
                    <FlatList 
                        data={this.state.mainTableData}
                        extraData={this.state}
                        keyExtractor={(item, index) => item.toString()}
                        renderItem={({item}) => 
                            <DataList 
                                CBoxValue={item.checkBoxStatus}
                                onChangeCheck={this.selectHandler.bind(null, item.id_main)}
                                key={ item.id_main } 
                                data={ item } onPress={() => this.props.navigation
                                    .navigate('review', { dataReview: item.id_main }) }
                            />
                        }
                    />
                </CommonPage>
            </View>
        );
    }    
}

const styles = {
    styContent: {
        flex: 1, 
        backgroundColor: '#ffffff'             
    },    
    styTopTitle: {
        flex: 1, 
        color: '#747d8c', 
        fontSize: 18,
        fontFamily: 'quicksand'  
    },
}

//Realm Database
const mainTable = {
    name: 'main_table',
    properties: {
        id_main: 'int',
        title: 'string',
        category: 'string',
        status: 'string'
    }
}

const listTable = {
    name: 'list_table',
    properties: {
        id_main: 'int',
        id_list: 'int',
        abbrevation: 'string',
        meaning: 'string'
    }
}

const databaseOptions = {
    schema: [mainTable, listTable]
}

export { Home }
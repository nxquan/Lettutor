import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';

import styles from './styles';
import Header from '@/components/Header';
import {colors} from '@/constants';
import Button from '@/components/Button';
import TutorItem from './components/TutorItem';
import Pagination from '@/components/Pagination';
import DropdownMenu from '@/components/DropdownMenu';
import StackProps from '@/types/type';
import {useNavigation} from '@react-navigation/native';
import DrawerButton from '@/components/DrawerButton';
import {useGlobalContext} from '@/hooks';
import {TEST_PREPARATIONS, LEARN_TOPICS} from '@/store/mock-data';

const width = Dimensions.get('window').width; //full width

const typesOfTutor = [
  {
    id: 9,
    key: 'all',
    name: 'All',
    createdAt: '2021-09-05T15:12:34.907Z',
    updatedAt: '2021-09-05T15:12:34.907Z',
  },
  ...LEARN_TOPICS,
  ...TEST_PREPARATIONS,
];

const nationalities = [
  {id: 1, title: 'Foreign tutor', key: 'foreign-tutor'},
  {id: 2, title: 'Vietnamese tutor', key: 'vietnamese-tutor'},
  {id: 3, title: 'Native English tutor', key: 'native-english-tutor'},
];

type SearchState = {
  tutorName: string;
  nationalities: any;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  specialty: any;
};
const defaultSpecialty = {
  id: 9,
  key: 'all',
  name: 'All',
  createdAt: '2021-09-05T15:12:34.907Z',
  updatedAt: '2021-09-05T15:12:34.907Z',
};
const Tutor = () => {
  const navigation = useNavigation<StackProps>();
  const [state, dispatch] = useGlobalContext();

  const [isShowDatePicker, setIsShowDatePicker] = useState(false);
  const [isShowTimePicker, setIsShowTimePicker] = useState(false);
  const [isOpenNationality, setIsOpenNationality] = useState(false);
  const [timeType, setTimeType] = useState('start');

  const [tutors, setTutors] = useState<any[]>([]);
  const [currentTutors, setCurrentTutors] = useState([]);
  const scrollRef: any = useRef();
  const tutorRef: any = useRef();

  const [filters, setFilters] = useState<SearchState>({
    tutorName: '',
    nationalities: [],
    date: null,
    startTime: null,
    endTime: null,
    specialty: defaultSpecialty,
  });

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const {type} = event;
    if (type == 'set') {
      setIsShowDatePicker(false);
      setFilters((prev: any) => {
        const currentDate = selectedDate;
        return {...prev, date: currentDate};
      });
    } else {
      setIsShowDatePicker(false);
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const {type} = event;
    if (type === 'set') {
      const currentDate = selectedDate;
      setIsShowTimePicker(!isShowTimePicker);
      setFilters((prev: any) => {
        const _time: any = {};
        if (timeType === 'start') {
          _time.startTime = currentDate;
        } else if (timeType === 'end') {
          _time.endTime = currentDate;
        }

        return {...prev, ..._time};
      });
    } else {
      setIsShowTimePicker(!isShowTimePicker);
    }
  };

  const showTimePicker = (type: string) => {
    setIsShowTimePicker(!isShowTimePicker);
    setTimeType(type);
  };

  const onChangeNationality = (item: any) => {
    if (!filters.nationalities.includes(item)) {
      setFilters((prev: any) => {
        return {
          ...prev,
          nationalities: [...prev.nationalities, item],
        };
      });
    }
  };

  const renderSpecialties = () => {
    return typesOfTutor.map((item, index) => {
      let _styles = {
        color: colors.text,
        backgroundColor: colors.grey100,
      };
      if (filters.specialty.key === item.key) {
        _styles.color = colors.primary;
        _styles.backgroundColor = colors.backgroundActive;
      }

      return (
        <Button
          key={index}
          onPress={() => setFilters(prev => ({...prev, specialty: item}))}
          title={item.name}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            marginLeft: 10,
            marginBottom: 8,
            borderRadius: 6,
            borderColor: 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            ..._styles,
          }}
        />
      );
    });
  };

  const onChangeTutorList = (data: any) => {
    setCurrentTutors(data);
  };

  const renderNationalities = () => {
    let items: [] = filters.nationalities;
    return items.map((item: any, index: number) => {
      return (
        <View
          key={index}
          style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
            flexDirection: 'row',
            paddingVertical: 2,
            marginLeft: 4,
            marginTop: 4,
          }}>
          <Text style={{fontSize: 14, color: colors.text}}>{item.title}</Text>
          <TouchableWithoutFeedback
            onPress={() => {
              setIsOpenNationality(false);
              setFilters((prev: any) => {
                return {
                  ...prev,
                  nationalities: prev.nationalities.filter(
                    (e: any) => e.key !== item.key,
                  ),
                };
              });
            }}>
            <AntDesign
              name="close"
              size={20}
              color="rgba(0,0,0,0.6)"
              style={{marginLeft: 4}}
            />
          </TouchableWithoutFeedback>
        </View>
      );
    });
  };

  useEffect(() => {
    scrollRef.current &&
      scrollRef.current?.scrollTo({
        y: 0, //680
        animated: true,
      });
  }, [currentTutors]);

  useEffect(() => {
    const handleSearch = () => {
      let _rawData: any[] = state.tutors;
      const conditions: {
        name?: string;
        specialtyKey?: string;
        isNative?: boolean;
        isForeign?: boolean;
        isVietnamese?: boolean;
      } = {};
      if (filters.tutorName.length > 0) {
        conditions.name = filters.tutorName;
      }

      if (filters.specialty) {
        conditions.specialtyKey = filters.specialty.key;
      }

      if (Object.keys(filters.nationalities).length > 0) {
        conditions.isNative = filters?.nationalities.some(
          (item: any) => item.key === 'native-english-tutor',
        );
        conditions.isForeign = !!filters?.nationalities.some(
          (item: any) => item.key === 'foreign-tutor',
        );
        conditions.isVietnamese = !!filters?.nationalities.some(
          (item: any) => item.key === 'vietnamese-tutor',
        );
      }
      _rawData = _rawData.filter(item => {
        const result: boolean[] = [];
        if (conditions.name) {
          result.push(String(item.name).includes(conditions.name));
        } else if (conditions.specialtyKey) {
          if (conditions.specialtyKey !== 'all') {
            result.push(
              String(item.specialties).includes(conditions.specialtyKey),
            );
          }
        }
        if (conditions.isNative) {
          result.push(item.isNative === conditions?.isNative);
        }
        if (conditions.isForeign) {
          result.push(item.country !== 'VN');
        }
        if (conditions.isVietnamese) {
          result.push(item.country === 'VN');
        }
        return result.every(item => item);
      });
      setTutors(_rawData);
    };

    handleSearch();
  }, [filters]);

  return (
    <ScrollView
      ref={scrollRef}
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
      style={{backgroundColor: colors.white}}>
      <Header drawerBtn={<DrawerButton />} />
      {/* Notification */}
      <LinearGradient
        start={{x: 0.1, y: 0}}
        end={{x: 0.75, y: 1.0}}
        style={styles.notiContainer}
        colors={['rgb(12, 61, 223)', 'rgb(5, 23, 157)']}>
        <View>
          <Text style={styles.notiHeading}>Upcoming lesson</Text>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <View style={{flex: 1}}>
              <Text style={styles.notiDateText}>
                Fri, 20 Oct 23 00:30 - 00:55
              </Text>
              <Text style={styles.notiRemainTimeText}>(starts in ...)</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('VideoCall')}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.white,
                flex: 1,
                flexDirection: 'row',
                flexShrink: 0,
                alignItems: 'center',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
              <Feather name="youtube" size={24} color={colors.primary} />
              <Text
                style={{marginLeft: 6, color: colors.primary, fontSize: 14}}>
                Enter lesson room
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: colors.white,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '500',
              marginTop: 12,
            }}>
            Total lesson time is 507 hours 5 minutes
          </Text>
        </View>
      </LinearGradient>

      {/* Tutor Container */}
      <View style={styles.tutorContainer}>
        <Text
          style={{
            color: colors.black,
            fontSize: 29,
            fontWeight: '700',
            marginBottom: 6,
          }}>
          Find a tutor
        </Text>

        <TextInput
          placeholder="Enter tutor name"
          placeholderTextColor={colors.text}
          value={filters.tutorName}
          onChangeText={text =>
            setFilters(prev => ({...prev, tutorName: text}))
          }
          style={[
            styles.inputContainer,
            {flex: 1, marginRight: 12, marginBottom: 12},
          ]}
        />

        <DropdownMenu
          isOpen={isOpenNationality}
          data={nationalities}
          onChangeOpen={setIsOpenNationality}
          onChangeSelected={onChangeNationality}
          selectedItem={filters.nationalities}
          style={{zIndex: 3}}>
          <Pressable
            onPress={() => setIsOpenNationality(!isOpenNationality)}
            style={styles.dropdownMenuBtn}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginLeft: -8,
                marginTop: -4,
              }}>
              {filters.nationalities?.length > 0 ? (
                renderNationalities()
              ) : (
                <Text style={{fontSize: 14, color: colors.text}}>
                  Select nationalities
                </Text>
              )}
            </View>
            {isOpenNationality ? (
              <Entypo
                name="chevron-small-down"
                size={24}
                color="black"
                style={{marginLeft: -20}}
              />
            ) : (
              <Entypo
                name="chevron-small-right"
                size={24}
                color="black"
                style={{marginLeft: -20}}
              />
            )}
          </Pressable>
        </DropdownMenu>
        <Text
          style={{
            color: colors.black,
            fontSize: 18,
            fontWeight: '500',
            marginTop: 10,
            marginBottom: 4,
          }}>
          Select available tutoring time:
        </Text>

        {/*Input date & time */}
        <View>
          <View
            style={[
              styles.inputContainer,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '50%',
              },
            ]}>
            <Pressable onPress={() => setIsShowDatePicker(!isShowDatePicker)}>
              <Text style={{color: colors.text, paddingVertical: 2}}>
                {filters.date ? filters.date?.toDateString() : 'Select a day'}
              </Text>
            </Pressable>
            <FontAwesome
              onPress={() => setFilters((prev: any) => ({...prev, date: null}))}
              name="calendar"
              size={18}
              color={colors.grey500}
              style={{marginLeft: 20}}
            />
            {isShowDatePicker && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={filters.date ? filters.date : new Date()}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View
            style={[
              styles.inputContainer,
              {
                flexDirection: 'row',
                alignItems: 'center',
                width: (width * 3) / 4,
                marginTop: 12,
              },
            ]}>
            <Pressable //Only on android
              onPress={() => {
                showTimePicker('start');
              }}
              style={{flex: 1, paddingVertical: 2}}>
              <Text
                onPressIn={() => {
                  //with editable(false), onPressIn only will work on iOS
                  showTimePicker('start');
                }}
                style={{flex: 1, color: colors.text}}>
                {filters.startTime
                  ? filters.startTime.toLocaleTimeString()
                  : 'Start time'}
              </Text>
            </Pressable>
            <Entypo
              style={{marginHorizontal: 12}}
              name="arrow-long-right"
              size={20}
              color={colors.text}
            />
            <Pressable
              style={{flex: 1, paddingVertical: 2}}
              onPress={() => {
                showTimePicker('end');
              }}>
              <Text
                onPressIn={() => {
                  showTimePicker('end');
                }}
                style={{flex: 1, color: colors.text}}>
                {filters.endTime
                  ? filters.endTime.toLocaleTimeString()
                  : 'End time'}
              </Text>
            </Pressable>
            <AntDesign
              style={{marginLeft: 12}}
              name="clockcircleo"
              size={20}
              color={colors.text}
              onPress={() => {
                setFilters((prev: any) => {
                  return {
                    ...prev,
                    startTime: null,
                    endTime: null,
                  };
                });
              }}
            />
            {isShowTimePicker && (
              <DateTimePicker
                mode="time"
                display="spinner"
                value={filters.startTime ? filters.startTime : new Date()}
                onChange={onChangeTime}
              />
            )}
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            marginLeft: -12,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {renderSpecialties()}
        </View>
        <Button
          title="Reset filters"
          style={styles.resetBtn}
          onPress={() => {
            setFilters({
              tutorName: '',
              nationalities: {},
              date: null,
              startTime: null,
              endTime: null,
              specialty: defaultSpecialty,
            });
          }}
        />
        <View>
          <Text
            ref={tutorRef}
            style={{
              color: colors.black,
              fontSize: 20,
              fontWeight: '600',
              marginTop: 10,
            }}>
            Recommended Tutors
          </Text>
          <View style={styles.tutorList}>
            {currentTutors.length > 0 ? (
              currentTutors.map((tutorItem: any) => {
                return <TutorItem data={tutorItem} key={tutorItem?.id} />;
              })
            ) : (
              <Text
                style={{
                  marginTop: 16,
                  color: colors.black,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                Empty list. Find other tutors!
              </Text>
            )}
          </View>
          <Pagination
            ITEMS_PER_PAGE={5}
            data={tutors}
            onChangeDataInPage={onChangeTutorList}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Tutor;

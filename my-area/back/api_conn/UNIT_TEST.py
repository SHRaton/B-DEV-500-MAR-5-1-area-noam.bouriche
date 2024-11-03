import unittest
from unittest.mock import Mock, patch, MagicMock
import pandas as pd
from datetime import datetime
import json
import sys
import os
import discord

from main import DataStructThread

#
#  USAGE: (freqtradvenv) ➜  api_conn git:(main) ✗ python -m pytest UNIT_TEST.py -v
#

class TestDataStructThread(unittest.TestCase):

    def setUp(self):
        self.mock_df = pd.DataFrame({
            'id': [1, 2],
            'isActive': [1, 1],
            'action_1': ['BTC', 'IS_STREAMING'],
            'action_1_info': ['', 'Gotaga'],
            'reaction_1': ['Discord_1', 'Spotify_1'],
            'reaction_2': ['Deepl_1', None],
            'reaction_3': [None, None],
            'reaction_1_info': ['{"message": "Test", "langue": "FR"}', None],
            'reaction_2_info': [None, None],
            'reaction_3_info': [None, None]
        })

        patcher = patch('main.get_data_from_db')
        self.mock_db = patcher.start()
        self.mock_db.return_value = self.mock_df
        self.addCleanup(patcher.stop)

        self.data_struct = DataStructThread()
        self.data_struct.df = self.mock_df


    def test_convert_to_list(self):
        actions = ['Discord_1', 'Deepl_1', 'Spotify_1']
        result = self.data_struct.convert_to_list(actions)
        self.assertEqual(result, [2, 1, 3])


    def test_get_react_from_bd(self):
        self.data_struct.get_react_from_bd(1)
        self.assertEqual(self.data_struct.react_n, [2, 1])

    def test_get_data_trigger_from_bd(self):
        result = self.data_struct.get_data_trigger_from_bd(1)
        self.assertEqual(result, 1)


    def test_get_react_n(self):
        self.data_struct.react_n = [1, 2, 3]
        result = self.data_struct.get_react_n()
        self.assertEqual(result, [1, 2, 3])


    def test_get_streamer_name(self):
        self.data_struct.area_id = 2
        self.data_struct.get_streamer_name()
        self.assertEqual(self.data_struct.streamer_name, 'Gotaga')


    @patch('main.get_weather')
    def test_is_raining(self, mock_weather):
        mock_weather.return_value = {"rain_1h": 1.0}
        self.assertTrue(self.data_struct.is_raining())


    @patch('main.get_weather')
    def test_is_sunset(self, mock_weather):
        current_hour = datetime.now().hour
        mock_weather.return_value = {"sunset": f"{current_hour}:00"}
        self.assertTrue(self.data_struct.is_sunset())


#    @patch('main.translate_to')
#    @patch('main.get_user_playlists')
#    def test_multi_react(self, mock_playlists, mock_translate):
#        mock_translate.return_value = "Translated text"
#        mock_playlists.return_value = ["Playlist 1", "Playlist 2"]
#
#        self.data_struct.react_n = [1]
#        self.data_struct.text_to_send = "Test text"
#        self.data_struct.multi_react()
#        mock_translate.assert_called_once_with("Test text", self.data_struct.lang)
#

    @patch('main.discord.Client')
    def test_send_message(self, mock_client):
        mock_channel = Mock()
        mock_client.return_value.get_channel.return_value = mock_channel

        self.data_struct.text_to_send = "Test message"
        result = self.data_struct.send_message()
        self.assertTrue(result)


#    @patch('main.check_btc_increase')
#    def test_trigger_selector_btc(self, mock_btc):
#        self.data_struct.trigger_n = 1
#        mock_btc.return_value = True
#        self.assertTrue(self.data_struct.trigger_selector())


    def test_parse_reaction_info(self):
        """Test parse_reaction_info method"""
        mock_df = pd.DataFrame({
            'id': [1],
            'reaction_1': ['Deepl_1'],
            'reaction_1_info': ['{"message": "Test", "langue": "FR"}'],
            'reaction_2': [None],
            'reaction_2_info': [None],
            'reaction_3': [None],
            'reaction_3_info': [None]
        })

        self.data_struct.df = mock_df

        self.data_struct.text = ""
        self.data_struct.lang = ""

        self.data_struct.parse_reaction_info(1)

        self.assertEqual(self.data_struct.text, "Test", "Le texte n'a pas été correctement extrait")
        self.assertEqual(self.data_struct.lang, "FR", "La langue n'a pas été correctement extraite")


    def test_convert_to_list_empty(self):
        """Test convert_to_list with empty list"""
        result = self.data_struct.convert_to_list([])
        self.assertEqual(result, [])


    def test_convert_to_list_invalid_actions(self):
        """Test convert_to_list with invalid actions"""
        result = self.data_struct.convert_to_list(['Invalid_1', 'Wrong_2'])
        self.assertEqual(result, [])


    def test_convert_to_list_mixed_actions(self):
        """Test convert_to_list with mix of valid and invalid actions"""
        result = self.data_struct.convert_to_list(['Discord_1', 'Invalid', 'Spotify_1'])
        self.assertEqual(result, [2, 3])


    def test_get_react_from_bd_nonexistent_id(self):
        """Test get_react_from_bd with non-existent ID"""
        self.data_struct.get_react_from_bd(999)
        self.assertEqual(self.data_struct.react_n, [])


    def test_get_data_trigger_from_bd_invalid_action(self):
        """Test get_data_trigger_from_bd with invalid action"""
        mock_df = pd.DataFrame({
            'id': [3],
            'isActive': [1],
            'action_1': ['INVALID_ACTION'],
        })
        self.data_struct.df = mock_df
        result = self.data_struct.get_data_trigger_from_bd(3)
        self.assertEqual(result, 0)


    @patch('main.get_weather')
    def test_is_raining_no_rain(self, mock_weather):
        """Test is_raining when it's not raining"""
        mock_weather.return_value = {"rain_1h": 0.1}
        self.assertFalse(self.data_struct.is_raining())


    @patch('main.get_weather')
    def test_is_sunset_different_hour(self, mock_weather):
        """Test is_sunset when it's not sunset time"""
        current_hour = datetime.now().hour
        mock_weather.return_value = {"sunset": f"{(current_hour + 1) % 24}:00"}
        self.assertFalse(self.data_struct.is_sunset())


    @patch('main.discord.Client')
    def test_send_message_empty_message(self, mock_client):
        """Test send_message with empty message"""
        self.data_struct.text_to_send = ""
        self.data_struct.discord_mess = ""
        result = self.data_struct.send_message()
        self.assertFalse(result)


 #   @patch('main.translate_to')
 #   def test_multi_react_list_translation(self, mock_translate):
 #       """Test multi_react with list translation"""
 #       mock_translate.return_value = "Translated Title"
 #       self.data_struct.react_n = [1]
 #       self.data_struct.text_to_send = [("Original Title", "Artist", "Album")]
 #       self.data_struct.multi_react()
 #       self.assertEqual(
 #           self.data_struct.text_to_send, 
 #           [("Translated Title", "Artist", "Album")]
 #       )


    def test_parse_reaction_info_invalid_json(self):
        """Test parse_reaction_info with invalid JSON"""
        mock_df = pd.DataFrame({
            'id': [1],
            'reaction_1': ['Deepl_1'],
            'reaction_1_info': ['invalid json'],
            'reaction_2': [None],
            'reaction_2_info': [None]
        })
        self.data_struct.df = mock_df
        self.data_struct.parse_reaction_info(1)
        self.assertEqual(self.data_struct.text, "")
        self.assertEqual(self.data_struct.lang, "")

 #   def test_trigger_selector_invalid_trigger(self):
 #       """Test trigger_selector with invalid trigger number"""
 #       self.data_struct.trigger_n = 999
 #       result = self.data_struct.trigger_selector()
 #       self.assertFalse(result)
#
    @patch('main.is_streaming')
    def test_trigger_selector_streaming(self, mock_streaming):
        """Test trigger_selector for streaming"""
        self.data_struct.trigger_n = 2
        self.data_struct.area_id = 1

        mock_df = pd.DataFrame({
            'id': [1],
            'action_1_info': ['TestStreamer']
        })
        self.data_struct.df = mock_df
        mock_streaming.return_value = True

        result = self.data_struct.trigger_selector()


        mock_streaming.assert_called_once()
        self.assertTrue(result)

    def test_stop_method(self):

        self.data_struct.stop()
        self.assertFalse(self.data_struct.running)

    def test_run_method_basic(self):

        self.data_struct.running = False
        self.data_struct.run()


    def test_extract_hour_valid_format(self):

        result = self.data_struct.extract_hour("14:30")
        self.assertEqual(result, 14)

    def test_get_react_n_invalid_numbers(self):

        self.data_struct.react_n = [0, 10, 5]
        result = self.data_struct.get_react_n()
        self.assertEqual(result, [0, 10, 5])

if __name__ == '__main__':
    unittest.main()
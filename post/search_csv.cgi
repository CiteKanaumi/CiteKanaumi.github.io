#!/usr/bin/perl

# Copyright (C) 2001-2003 All right reserved by Shinya Kondo ( CGI KON )

require "cgi-lib.pl";

# 検索用関数

sub Search_Pattern
{
	my($record,@pattern) = @_;

	foreach (@pattern) {
		return 0 if($record !~ /$_/);
	}

	return 1;
}

# メインプログラム

	&ReadParse;

	$keyword = $in{"keyword"};
	if($in{'search'}) {
		if(!$keyword) {
			$error = "キーワードが入力されていません";
			$in{'search'} = "";
		}
	}

	if($in{'search'}) {
		if(!open(IFILE,"search_csv.csv")) {
			$error = "該当ファイルを参照できません";
			$in{'search'} = "";
		}
	}

# 検索ページの表示

print "Content-type: text/html\n\n";

print qq!
<HTML>
<HEAD>
	<META Http-Equiv="Content-Type" Content="text/html;charset=UTF-8">
	<TITLE>ファイル簡易検索</TITLE>
</HEAD>
<BODY>
	<B>ファイル簡易検索</B>
	<BR>
<CENTER>
	<FORM ACTION="search_csv.cgi" METHOD="post">
		<INPUT TYPE="hidden" NAME="search" VALUE="検索する">
		キーワード：
		<INPUT TYPE="text" NAME="keyword" VALUE="$keyword" SIZE="30">
		<INPUT TYPE="submit" NAME="search" VALUE="検索する">
	</FORM>
	<FONT COLOR="#FF0000">$error</FONT>
	<HR>
	<P>
!;

	if($in{'search'}) {
		print qq!<TABLE BORDER=1>\n!;

		$title = <IFILE>;
		chomp($title);
		@column = split(",",$title);

		print qq!<TR>\n!;
		foreach (@column) {
			print qq!<TD BGCOLOR="#00FFFF" NOWRAP>$_</TD>\n!;
		}
		print qq!</TR>\n!;

		$keyword =~ s/　/ /g;
		@pattern = split(/ /,$keyword);
		while($line = <IFILE>) {
			next if(!&Search_Pattern($line,@pattern));

			chomp($line);
			@column = split(",",$line);

			print qq!<TR>\n!;
			foreach (@column) {
				print qq!<TD>$_</TD>\n!;
			}
			print qq!</TR>\n!;
		}
		close(IFILE);

		print qq!</TABLE>\n!;
	} else {
		print qq!キーワードを入力し、検索ボタンを押すと検索結果がここに表示されます。\n!;
	}

print qq!
	<P>
	<FONT SIZE=2><I>
	Copyright (C) 2001-2003 All right reserved by <A HREF="http://cgikon.com">CGI KON</A>
	</I></FONT>
</CENTER>
</BODY>
</HTML>
!;

# Copyright (C) 2001-2003 All right reserved by Shinya Kondo ( CGI KON )

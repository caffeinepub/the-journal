import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinBlobStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinBlobStorage();

  type CategoryV1 = {
    #health; #anime; #lifestyle; #travel; #recipes; #tech; #other;
  };

  type BlogPostV1 = {
    id : Nat; title : Text; body : Text; category : CategoryV1;
    authorId : Principal; authorName : Text; createdAt : Int;
    coverImageUrl : ?Text; likeCount : Nat; likes : [Principal];
  };

  type Category = {
    #health; #anime; #lifestyle; #travel; #recipes; #tech; #other; #poetries;
  };

  public type BlogPost = {
    id : Nat; title : Text; body : Text; category : Category;
    authorId : Principal; authorName : Text; createdAt : Int;
    coverImageUrl : ?Text; likeCount : Nat; likes : [Principal];
  };

  module BlogPost {
    public func computeLikeCount(likes : [Principal]) : Nat {
      switch (Nat.compare(likes.size(), 1)) {
        case (#less) { 0 }; case (#equal) { 1 }; case (#greater) { likes.size() };
      };
    };
    public func compareByLikes(post1 : BlogPost, post2 : BlogPost) : Order.Order {
      Nat.compare(post1.likeCount, post2.likeCount);
    };
  };

  public type Comment = {
    id : Nat; postId : Nat; authorName : Text; body : Text; createdAt : Int;
  };

  public type UserProfile = {
    name : Text; about : ?Text; profilePicUrl : ?Text;
  };

  public type ActivityKind = { #like; #comment; #post; };

  public type ActivityItem = {
    kind : ActivityKind;
    actorName : Text;
    postTitle : Text;
    postId : Nat;
    timestamp : Int;
  };

  public type PostStats = {
    postId : Nat;
    title : Text;
    views : Nat;
    likes : Nat;
    comments : Nat;
  };

  public type AnalyticsResult = {
    posts : [PostStats];
    totalViews : Nat;
    totalLikes : Nat;
    totalComments : Nat;
    recentActivity : [ActivityItem];
  };

  type UserProfileBase = { name : Text; };
  type UserProfileExt = { about : ?Text; profilePicUrl : ?Text; };

  var nextPostId = 3;
  var nextCommentId = 1;

  let posts : Map.Map<Nat, BlogPostV1> = Map.empty();
  let postsV2 : Map.Map<Nat, BlogPost> = Map.empty();
  let comments = Map.empty<Nat, List.List<Comment>>();
  let userProfiles = Map.empty<Principal, UserProfileBase>();
  let userProfilesExt = Map.empty<Principal, UserProfileExt>();

  // Pen-name based anonymous likes: postId -> Set of pen names
  let anonLikes = Map.empty<Nat, Set.Set<Text>>();

  // View counts: postId -> count
  let postViews = Map.empty<Nat, Nat>();

  // Activity feed (append-only; sliced on read)
  let activityFeed = List.empty<ActivityItem>();

  system func postupgrade() {
    for ((id, post) in posts.entries()) {
      if (postsV2.get(id) == null) {
        let category : Category = switch (post.category) {
          case (#health) #health; case (#anime) #anime; case (#lifestyle) #lifestyle;
          case (#travel) #travel; case (#recipes) #recipes; case (#tech) #tech;
          case (#other) #other;
        };
        postsV2.add(id, {
          id = post.id; title = post.title; body = post.body; category = category;
          authorId = post.authorId; authorName = post.authorName; createdAt = post.createdAt;
          coverImageUrl = post.coverImageUrl; likeCount = post.likeCount; likes = post.likes;
        });
      };
    };
  };

  func buildProfile(base : UserProfileBase, ext : ?UserProfileExt) : UserProfile {
    {
      name = base.name;
      about = switch (ext) { case (?e) e.about; case null null };
      profilePicUrl = switch (ext) { case (?e) e.profilePicUrl; case null null };
    };
  };

  func addActivity(item : ActivityItem) {
    activityFeed.add(item);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { return null; };
    switch (userProfiles.get(caller)) {
      case (null) null;
      case (?base) ?buildProfile(base, userProfilesExt.get(caller));
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (userProfiles.get(user)) {
      case (null) null;
      case (?base) ?buildProfile(base, userProfilesExt.get(user));
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, { name = profile.name });
    userProfilesExt.add(caller, { about = profile.about; profilePicUrl = profile.profilePicUrl });
  };

  public shared ({ caller }) func createPost(post : BlogPost) : async { id : Nat; createdAt : Int; } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users have permission to create posts");
    };
    let id = nextPostId;
    nextPostId += 1;
    let createdAt = Int.abs(Time.now());
    let newPost = { post with id; authorId = caller; createdAt; likeCount = 0; likes = []; };
    postsV2.add(id, newPost);
    addActivity({ kind = #post; actorName = post.authorName; postTitle = post.title; postId = id; timestamp = createdAt });
    { id; createdAt };
  };

  public shared ({ caller }) func updatePost(postId : Nat, post : BlogPost) : async () {
    switch (postsV2.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?existingPost) {
        if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
          Runtime.trap("Unauthorized: Must be logged in to edit posts");
        };
        let category = if (post.category == #other) { existingPost.category } else { post.category };
        postsV2.add(postId, { post with category });
      };
    };
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to delete posts");
    };
    postsV2.remove(postId);
  };

  public query ({ caller }) func getPostById(id : Nat) : async BlogPost {
    switch (postsV2.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };

  public query ({ caller }) func getAllPosts() : async [BlogPost] {
    postsV2.values().toArray();
  };

  public query ({ caller }) func getPostsByCategory(category : Category) : async [BlogPost] {
    postsV2.values().toArray().filter(func(post) { post.category == category });
  };

  public shared ({ caller }) func getPopularPosts(limit : Nat) : async [BlogPost] {
    let sortedPosts = postsV2.values().toArray().sort(BlogPost.compareByLikes);
    sortedPosts.sliceToArray(0, Nat.min(limit, sortedPosts.size()));
  };

  // Record a post view (anonymous, no deduplication)
  public shared ({ caller }) func recordPostView(postId : Nat) : async () {
    let current = switch (postViews.get(postId)) {
      case (null) 0;
      case (?n) n;
    };
    postViews.add(postId, current + 1);
  };

  // Like a post with a pen name (no authentication required)
  public shared ({ caller }) func addLikeToPost(postId : Nat, penName : Text) : async () {
    switch (postsV2.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let name = if (penName.size() == 0) { "Anonymous" } else { penName };
        let likers = switch (anonLikes.get(postId)) {
          case (null) Set.empty<Text>();
          case (?s) s;
        };
        if (likers.contains(name)) { Runtime.trap("You already liked this post") };
        likers.add(name);
        anonLikes.add(postId, likers);
        let newLikeCount = post.likeCount + 1;
        postsV2.add(postId, { post with likeCount = newLikeCount });
        addActivity({ kind = #like; actorName = name; postTitle = post.title; postId; timestamp = Int.abs(Time.now()) });
      };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    [#health, #anime, #lifestyle, #travel, #recipes, #tech, #other, #poetries];
  };

  public query ({ caller }) func getUniqueAuthors() : async [Text] {
    let uniqueAuthors = Set.empty<Text>();
    for (post in postsV2.values()) { uniqueAuthors.add(post.authorName) };
    uniqueAuthors.toArray();
  };

  public shared ({ caller }) func addCommentToPost(comment : Comment) : async Nat {
    if (comment.authorName.isEmpty() or comment.body.isEmpty() or comment.body.size() < 10) {
      Runtime.trap("Name and comment body cannot be empty or less than 10 characters");
    };
    let id = nextCommentId;
    nextCommentId += 1;
    let createdAt = Int.abs(Time.now());
    let newComment = { comment with id; createdAt };
    let postComments = switch (comments.get(comment.postId)) {
      case (null) { List.empty<Comment>() };
      case (?list) { list };
    };
    postComments.add(newComment);
    comments.add(comment.postId, postComments);
    let postTitle = switch (postsV2.get(comment.postId)) {
      case (null) "";
      case (?p) p.title;
    };
    addActivity({ kind = #comment; actorName = comment.authorName; postTitle; postId = comment.postId; timestamp = createdAt });
    id;
  };

  public shared ({ caller }) func deleteComment(postId : Nat, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete comments");
    };
    switch (comments.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?postComments) {
        comments.add(postId, postComments.filter(func(c) { c.id != commentId }));
      };
    };
  };

  public query ({ caller }) func getCommentsByPost(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?postComments) { postComments.toArray() };
    };
  };

  // Analytics: admin only
  public query ({ caller }) func getAnalytics() : async AnalyticsResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    var totalViews = 0;
    var totalLikes = 0;
    var totalComments = 0;
    let postStatsList = List.empty<PostStats>();
    for (post in postsV2.values()) {
      let views = switch (postViews.get(post.id)) { case (null) 0; case (?n) n; };
      let commentCount = switch (comments.get(post.id)) { case (null) 0; case (?l) l.size(); };
      let likes = Nat.max(post.likeCount, switch (anonLikes.get(post.id)) { case (null) 0; case (?s) s.size(); });
      totalViews += views;
      totalLikes += likes;
      totalComments += commentCount;
      postStatsList.add({ postId = post.id; title = post.title; views; likes; comments = commentCount });
    };
    // Return only the most recent 50 activity items
    let allActivity = activityFeed.toArray();
    let actLen = allActivity.size();
    let recentActivity = if (actLen > 50) { allActivity.sliceToArray(actLen - 50, actLen) } else { allActivity };
    {
      posts = postStatsList.toArray();
      totalViews;
      totalLikes;
      totalComments;
      recentActivity;
    };
  };

  public type UserInfo = {
    principal : Principal; role : AccessControl.UserRole; profile : ?UserProfile;
  };

  public query ({ caller }) func getUsers() : async [UserInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    let users = List.empty<UserInfo>();
    for ((principal, base) in userProfiles.entries()) {
      let role = AccessControl.getUserRole(accessControlState, principal);
      let profile = buildProfile(base, userProfilesExt.get(principal));
      users.add({ principal; role; profile = ?profile });
    };
    users.toArray();
  };

  public shared ({ caller }) func setAdminRole(user : Principal, isAdmin : Bool) : async () {
    let role = if (isAdmin) { #admin } else { #user };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  let sampleAuthorId = Principal.fromText("aaaaa-aa");
  let sampleAuthorName = "The Journal Team";
  let now = Int.abs(Time.now());

  public type PostBody = {
    id : Text; title : Text; body : Text; category : Category;
    authorId : Principal; authorName : Text; createdAt : Int;
    coverImageUrl : ?Text; likeCount : Nat; likes : [Principal];
  };

  public type CommentBody = {
    id : Nat; postId : Nat; authorName : Text; body : Text; createdAt : Int;
  };

  let sampleComments = List.empty<Comment>();
  let post1 = {
    id = 1; title = "Top 5 Best Romance Anime"; body = "Sample content";
    category = #anime; authorId = sampleAuthorId; authorName = sampleAuthorName;
    createdAt = now; coverImageUrl = null; likeCount = 0; likes = [];
  };
  let post2 = {
    id = 2; title = "Best Places to Visit in Japan"; body = "Sample content";
    category = #travel; authorId = sampleAuthorId; authorName = sampleAuthorName;
    createdAt = now; coverImageUrl = null; likeCount = 0; likes = [];
  };
  let samplePosts = [(post1.id, post1), (post2.id, post2)];

  public shared ({ caller }) func seedSample() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can seed sample");
    };
    postsV2.add(1, post1);
    postsV2.add(2, post2);
    comments.add(1, sampleComments);
    comments.add(2, sampleComments);
  };
};

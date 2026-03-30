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

  type UserProfileBase = { name : Text; };
  type UserProfileExt = { about : ?Text; profilePicUrl : ?Text; };

  var nextPostId = 3;
  var nextCommentId = 1;

  let posts : Map.Map<Nat, BlogPostV1> = Map.empty();
  let postsV2 : Map.Map<Nat, BlogPost> = Map.empty();
  let comments = Map.empty<Nat, List.List<Comment>>();
  let userProfiles = Map.empty<Principal, UserProfileBase>();
  let userProfilesExt = Map.empty<Principal, UserProfileExt>();

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

  public shared ({ caller }) func addLikeToPost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in users can like a post");
    };
    switch (postsV2.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let alreadyLiked = post.likes.find(func(author) { Principal.equal(author, caller) });
        if (alreadyLiked != null) { Runtime.trap("You already like this post") };
        let updatedLikes = List.empty<Principal>();
        for (like in post.likes.values()) { updatedLikes.add(like) };
        updatedLikes.add(caller);
        let newLikesArray = updatedLikes.toArray();
        postsV2.add(postId, { post with likes = newLikesArray; likeCount = BlogPost.computeLikeCount(newLikesArray) });
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
